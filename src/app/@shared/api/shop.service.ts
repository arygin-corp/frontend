import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Domain } from '../interfaces/domain';
import { Product } from '../interfaces/product';
import { ProductsList } from '../interfaces/list';
import { Brand } from '../interfaces/brand';
import { SerializedFilterValues } from '../interfaces/filter';
import { environment } from '../../../environments/environment';
import Fuse from 'fuse.js';

export interface ListOptions {
    domains?: string[];
    datatypes?: string[];
    page?: number;
    limit?: number;
    sort?: string;
    filterValues?: { [k: string]: string };
    status?: string;
    query?: string;
}

@Injectable({
    providedIn: 'root'
})

export class ShopService {
    private readonly apiBase = `${environment.apiUrl}/marketplace/api`;
    private readonly Base = `${environment.apiUrl}/marketplace/`;

    constructor(private http: HttpClient) { }

    // Add near the top of the class
    private productsCache: any[] | null = null;

    // Fetch and cache products-json (used for quick client-side filtering)
    private loadLocalProducts(): Observable<any[]> {
        if (this.productsCache) return of(this.productsCache);
        return this.http.get<any>(`${this.apiBase}/products-json/`).pipe(
            map(r => r.items || []),
            map(items => {
                const normalized = items.map((p: any) => ({
                    ...p,
                    images: Array.isArray(p.images) && p.images.length
                        ? p.images.map((img: any) => this.buildImageUrl(img))
                        : (p.image ? [this.buildImageUrl(p.image)] : ['assets/images/product-placeholder.png']),
                    short_desc: p.short_desc || p.brief_desc || p.summary || '',
                    sku: p.sku || p.product_sku || '',
                    slug: p.slug || p.product_slug || '',
                    data_steward: p.data_steward || null,
                    poc_name: p.poc_name || null
                }));
                this.productsCache = normalized;
                return normalized;
            }),
            catchError(() => of([]))
        );
    }

    // Lightweight client-side search across multiple fields
    localSearch(query: string, limit: number = 6): Observable<{ items: any[], did_you_mean: string | null }> {
        const q = (query || '').toString().toLowerCase().trim();
        if (!q) return of({ items: [], did_you_mean: null });

        return this.loadLocalProducts().pipe(
            map(items => {
            const matched = items.filter((p: any) => {
                if (!p) return false;
                if ((p.name || '').toString().toLowerCase().includes(q)) return true;
                if ((p.short_desc || p.brief_desc || p.summary || '').toString().toLowerCase().includes(q)) return true;
                if ((p.sku || '').toString().toLowerCase().includes(q)) return true;
                if ((p.datatype || '').toString().toLowerCase().includes(q)) return true;
                if ((p.domain || p.domain_name || '').toString().toLowerCase().includes(q)) return true;
                if (p.data_steward && ((p.data_steward.name || '').toString().toLowerCase().includes(q) || (p.data_steward.email || '').toString().toLowerCase().includes(q))) return true;
                if (p.poc_name && ((p.poc_name.name || '').toString().toLowerCase().includes(q) || (p.poc_name.email || '').toString().toLowerCase().includes(q))) return true;
                const tags = p.tags || p.keywords || [];
                if (Array.isArray(tags) && tags.some((t: any) => (t.name || t || '').toString().toLowerCase().includes(q))) return true;
                return false;
            });
            const sliced = matched.slice(0, limit);
            const did_you_mean = this.computeDidYouMean(query, sliced, 0.35);
            return { items: sliced, did_you_mean };
            }),
            catchError(() => of({ items: [], did_you_mean: null }))
        );
    }

    /**
     * Returns paginated products list with CLIENT-SIDE filtering.
     * Restored to work with products-json for high-performance demo data listing.
     */
    getProductsList(domainSlug: string | null, options: ListOptions): Observable<ProductsList> {
        const paramsObj: { [k: string]: string } = {};
        if (options.query && options.query.trim().length) paramsObj['q'] = options.query.trim();
        paramsObj['page'] = String(options.page || 1);
        paramsObj['limit'] = String(options.limit || 12);
        if (options.sort) paramsObj['sort'] = options.sort;
        let params = new HttpParams();
        Object.keys(paramsObj).forEach(k => params = params.set(k, paramsObj[k]));

        return this.http.get<any>(`${this.apiBase}/products/`, { params }).pipe(
            map(response => {
            let items: any[] = response.items || [];

            if (domainSlug && domainSlug !== 'all' && domainSlug !== '') {
                items = items.filter(item =>
                item.domain_slug === domainSlug ||
                item.subdomain_2_slug === domainSlug ||
                item.subdomain_3_slug === domainSlug
                );
            }

            if (options.filterValues) {
                Object.keys(options.filterValues).forEach(filterSlug => {
                const valueStr = options.filterValues![filterSlug];
                if (valueStr && valueStr.trim() !== '') {
                    const selectedValues = valueStr.split(',');
                    items = items.filter(item => {
                    const itemValue = item[filterSlug] || item[`${filterSlug}_slug`];
                    return selectedValues.includes(itemValue);
                    });
                }
                });
            }

            if (options.sort === 'name_asc') {
                items.sort((a, b) => a.name.localeCompare(b.name));
            } else if (options.sort === 'name_desc') {
                items.sort((a, b) => b.name.localeCompare(a.name));
            }

            const total = items.length;
            const limit = options.limit || 12;
            const page = options.page || 1;
            const pages = Math.ceil(total / limit);
            const from = (page - 1) * limit;
            const to = Math.min(from + limit, total);

            const paginatedItems = items.slice(from, to);

            return {
                items: paginatedItems,
                total: total,
                page: page,
                limit: limit,
                sort: options.sort || 'default',
                filters: response.filters || [],
                filterValues: options.filterValues || {},
                pages: pages,
                from: from + 1,
                to: to
            };
            }),
            catchError(error => of({
            items: [], total: 0, page: 1, limit: 12, sort: 'default',
            filters: [], filterValues: {}, pages: 1, from: 1, to: 0
            }))
        );
    }


     /**
     * Returns paginated products list with CLIENT-SIDE filtering.
     * Restored to work with products-json for high-performance demo data listing.
     */
    getShopProductsList(domainSlug: string | null, options: ListOptions): Observable<ProductsList> {
        // Use the local products.json file for development
        return this.http.get<any>('http://localhost:8000/marketplace/api/products-json/').pipe(
            map(response => {
                // Normalize: accept array or { items: [...] }
                let items: any[] = Array.isArray(response) ? response : (response.items || []);

                if (domainSlug && domainSlug !== 'all' && domainSlug !== '') {
                    items = items.filter(item => 
                        item.domain_slug === domainSlug || 
                        item.subdomain_2_slug === domainSlug || 
                        item.subdomain_3_slug === domainSlug
                    );
                }

                if (options.filterValues) {
                    Object.keys(options.filterValues).forEach(filterSlug => {
                        const valueStr = options.filterValues![filterSlug];
                        if (valueStr && valueStr.trim() !== '') {
                            const selectedValues = valueStr.split(',');
                            items = items.filter(item => {
                                const itemValue = item[filterSlug] || item[`${filterSlug}_slug`];
                                return selectedValues.includes(itemValue);
                            });
                        }
                    });
                }

                if (options.sort === 'name_asc') {
                    items.sort((a, b) => a.name.localeCompare(b.name));
                } else if (options.sort === 'name_desc') {
                    items.sort((a, b) => b.name.localeCompare(a.name));
                }

                const total = items.length;
                const limit = options.limit || 12;
                const page = options.page || 1;
                const pages = Math.ceil(total / limit);
                const from = (page - 1) * limit;
                const to = Math.min(from + limit, total);

                return {
                    items: items.slice(from, to),
                    total,
                    page,
                    limit,
                    sort: options.sort || 'default',
                    filters: response.filters || [],
                    filterValues: options.filterValues || {},
                    pages,
                    from: from + 1,
                    to
                };
            }),
            catchError(error => {
                console.error('Error fetching product list:', error);
                return of({
                    items: [], total: 0, page: 1, limit: 12, sort: 'default',
                    filters: [], filterValues: {}, pages: 1, from: 1, to: 0
                });
            })
        );
    }

    /**
     * Returns products related to the provided product.
     */
    getRelatedProducts(product: Partial<Product>, limit: number = 8): Observable<Product[]> {
        let params = new HttpParams().set('limit', limit.toString());
        if (product?.slug) {
            params = params.set('for', product.slug);
        }
        return this.http.get<Product[]>(`${this.apiBase}/products/related/`, { params });
    }

    /**
     * Returns domains by a list of slugs.
     */
    getDomainsBySlug(slugs: string[], depth: number = 0): Observable<Domain[]> {
        let params = new HttpParams()
            .set('slugs', slugs.join(','))
            .set('depth', depth.toString());
        return this.http.get<Domain[]>(`${this.apiBase}/domains/`, { params });
    }

    private normalizeSuggestion(p: any): any {
        return {
            ...p,
            // images array with fallback
            images: Array.isArray(p.images) && p.images.length
            ? p.images.map((img: any) => this.buildImageUrl(img))
            : (p.image ? [this.buildImageUrl(p.image)] : ['assets/images/product-placeholder.png']),
            // steward flattened
            data_steward_name: p.data_steward?.name || p.data_steward_name || '',
            data_steward_email: p.data_steward?.email || p.data_steward_email || '',
            // point-of-contact flattened
            poc_name: p.poc_name?.name || (typeof p.poc_name === 'string' ? p.poc_name : '') || '',
            poc_email: p.poc_name?.email || p.poc_email || '',
            // common fields normalized
            short_desc: p.short_desc || p.brief_desc || p.summary || '',
            sku: p.sku || p.product_sku || '',
            slug: p.slug || p.product_slug || '',
            domain: p.domain || p.domain_name || '',
            owner: p.owner || p.owner_name || p.business_contact_name || '',
            tags: p.tags || p.keywords || [],
            id: p.id ?? p.product_id ?? p.sku ?? p.slug ?? null
        };
    }

    private suggestionsCache = new Map<string, { ts: number, value: any }>();
    private cacheTTL = 60 * 1000;


    getSuggestions(query: string, limit = 8, opts: any = {}): Observable<any> {
        const key = `${opts.domain||'all'}::${query}::${limit}`;
        const now = Date.now();
        const cached = this.suggestionsCache.get(key);
        if (cached && (now - cached.ts) < this.cacheTTL) {
            return of(cached.value);
        }

        let params = new HttpParams().set('q', query).set('limit', String(limit));
        if (opts.domain) params = params.set('domain', opts.domain);

        return this.http.get<any>(`${this.apiBase}/search/suggestions/`, { params }).pipe(
            map(res => {
                const out = {
                    items: (res.items || []).map((p: any) => ({
                    id: Number(p.id) || undefined,
                    name: p.name || '',
                    short_desc: p.short_desc || p.brief_desc || '',
                    slug: p.slug || '',
                    sku: p.sku || '',
                    thumbnail: p.thumbnail ? this.buildImageUrl(p.thumbnail) : (p.images && p.images[0] ? this.buildImageUrl(p.images[0]) : 'assets/images/product-placeholder.png'),
                    images: Array.isArray(p.images) && p.images.length ? p.images.map((img: any) => this.buildImageUrl(img)) : (p.image ? [this.buildImageUrl(p.image)] : ['assets/images/product-placeholder.png']),
                    datatype: p.datatype || '',
                    data_steward_name: p.data_steward?.name || '',
                    poc_name: p.poc_name?.name || ''
                    })),
                    total_items: res.total_items || 0
                };

                const did_you_mean = this.computeDidYouMean(query, out.items, 0.35);
                const result = { ...out, did_you_mean };

                this.suggestionsCache.set(key, { ts: now, value: result });
                if (this.suggestionsCache.size > 200) {
                    const oldest = Array.from(this.suggestionsCache.keys()).sort((a, b) => (this.suggestionsCache.get(a)!.ts - this.suggestionsCache.get(b)!.ts))[0];
                    this.suggestionsCache.delete(oldest);
                }
                return result;
            }),
            catchError(() => of({ items: [], total_items: 0 }))
        );
    }

    getDomain(slug: string): Observable<any> {
        return this.http.get<any>(`${this.apiBase}/domains/${slug}/`);
    }

    getDomains(parent: Partial<Domain> | null = null, depth: number = 0): Observable<Domain[]> {
        let params = new HttpParams().set('depth', depth.toString());
        if (parent?.slug) params = params.set('parent', parent.slug);
        return this.http.get<Domain[]>(`${this.apiBase}/domains/`, { params });
    }

    getProduct(productSlug: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiBase}/products/${productSlug}/`);
    }

    getPopularBrands(): Observable<Brand[]> {
        return this.http.get<Brand[]>(`${this.apiBase}/brands/`);
    }

    getLatestProducts(domainSlug: string | null = null, limit: number | null = null): Observable<Product[]> {
        let params = new HttpParams();
        if (domainSlug) params = params.set('domain', domainSlug);
        if (limit) params = params.set('limit', limit.toString());
        return this.http.get<Product[]>(`${this.apiBase}/products/latest/`, { params });
    }

    getBestsellers(limit: number | null = null): Observable<Product[]> {
        let params = new HttpParams();
        if (limit) params = params.set('limit', limit.toString());
        return this.http.get<Product[]>(`${this.apiBase}/products/bestsellers/`, { params });
    }

    private buildImageUrl(image: string): string {
        if (!image) return 'assets/images/product-placeholder.png';
        const trimmed = image.toString().trim();
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        const base = (this.Base || '').replace(/\/$/, '');
        return `${base}/products/${trimmed.replace(/^\/+/, '')}`;
    }


    private computeDidYouMean(query: string, items: any[], threshold = 0.35): string | null {
        if (!query || query.trim().length < 3 || !items || items.length === 0) return null;

        const canonicalMap: Record<string, string> = {
            'toyata': 'toyota',
            'toyataa': 'toyota',
            'toyatah': 'toyota'
        };

        const qLower = query.toString().toLowerCase().trim();
        const usedQuery = canonicalMap[qLower] || query;
        const fuseQuery = usedQuery;

        const options: Fuse.IFuseOptions<any> = {
            includeScore: true,
            shouldSort: true,
            threshold,
            keys: [
            { name: 'name',              weight: 0.7 },
            { name: 'short_desc',        weight: 0.12 },
            { name: 'datatype',          weight: 0.06 },
            { name: 'classification',    weight: 0.03 },
            { name: 'tags',              weight: 0.04 },
            { name: 'data_steward_name', weight: 0.03 },
            { name: 'poc_name',          weight: 0.02 }
            ]
        };

        try {
            const fuse = new Fuse(items, options);
            const results = fuse.search(fuseQuery);
            if (!results || results.length === 0) return null;

            const best = results[0];
            if (best?.score != null && best.score <= threshold) {
            const candidate = best.item?.name || best.item?.slug || null;
            if (!candidate) return null;
            if (candidate.toString().toLowerCase().trim() === qLower) return null;
            return candidate;
            }
            return null;
        } catch {
            return null;
        }
    }
}