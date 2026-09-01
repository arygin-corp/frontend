import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Domain } from '../interfaces/domain';
import { Product } from '../interfaces/product';
import { ProductsList } from '../interfaces/list';
import { Brand } from '../interfaces/brand';
import { CheckFilter, Filter, SerializedFilterValues } from '../interfaces/filter';
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
    
    private productsCache: any[] | null = null;
    private fullProductsCache: any[] | null = null;
    private vocabularyCache: Set<string> = new Set();
    private suggestionsCache = new Map<string, { ts: number, value: any }>();
    private filterCache = new Map<string, { ts: number, value: Filter[] }>();
    
    private readonly PRODUCTS_PER_PAGE = 6;
    private readonly cacheTTL = 60 * 1000;
    private readonly filterCacheTTL = 30 * 1000;

    constructor(private http: HttpClient) { }

    private loadLocalProducts(): Observable<any[]> {
        if (this.productsCache) return of(this.productsCache);
        
        return this.http.get<any>(`${this.apiBase}/products-json/`).pipe(
            map(r => r.items || []),
            map(items => this.normalizeProducts(items)),
            map(normalized => {
                this.productsCache = normalized;
                this.buildVocabulary(normalized);
                return normalized;
            }),
            catchError(() => of([]))
        );
    }

    private loadAllProducts(): Observable<any[]> {
        if (this.fullProductsCache) return of(this.fullProductsCache);
        
        return this.http.get<any>(`${this.apiBase}/products-json/`).pipe(
            map(response => {
                const items = Array.isArray(response) ? response : (response.items || []);
                const normalized = this.normalizeProducts(items);
                this.fullProductsCache = normalized;
                return normalized;
            }),
            catchError(() => of([]))
        );
    }

    private normalizeProducts(items: any[]): any[] {
        return (items || []).map((product: any) => {
            const domain = product.domain || product.domain_name || '';
            const subdomain2 = product.subdomain_2 || '';
            const subdomain3 = product.subdomain_3 || '';

            return {
                ...product,
                domain,
                domain_slug: product.domain_slug || this.toSlug(domain),

                subdomain_2: subdomain2,
                subdomain_2_slug: product.subdomain_2_slug || this.toSlug(subdomain2),

                subdomain_3: subdomain3,
                subdomain_3_slug: product.subdomain_3_slug || this.toSlug(subdomain3),

                images: Array.isArray(product.images) && product.images.length
                    ? product.images.map((image: any) => this.buildImageUrl(image))
                    : product.image
                        ? [this.buildImageUrl(product.image)]
                        : ['assets/images/product-placeholder.png'],

                short_desc: product.short_desc ||
                    product.brief_desc ||
                    product.summary ||
                    '',

                sku: product.sku || product.product_sku || '',
                slug: product.slug || product.product_slug || '',
                data_steward: product.data_steward || null,
                poc_name: product.poc_name || null,
                _normalized: true
            };
        });
    }

    private toSlug(value: unknown): string {
        return (value || '')
            .toString()
            .trim()
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    localSearch(query: string, page: number = 1): Observable<{ items: any[], did_you_mean: string | null, total_pages: number, total_items: number, current_page: number }> {
        const q = (query || '').toString().toLowerCase().trim();
        if (!q) return of({ items: [], did_you_mean: null, total_pages: 0, total_items: 0, current_page: 1 });

        return this.loadLocalProducts().pipe(
            map(items => {
                if (this.vocabularyCache.size === 0) {
                    this.buildVocabulary(items);
                }

                const matched = this.matchItems(items, q);
                const ranked = this.rankResults(matched, q);
                
                const total_items = ranked.length;
                const total_pages = Math.ceil(total_items / this.PRODUCTS_PER_PAGE);
                const from = (page - 1) * this.PRODUCTS_PER_PAGE;
                const to = Math.min(from + this.PRODUCTS_PER_PAGE, total_items);
                const paginated = ranked.slice(from, to);

                const did_you_mean = this.computeDidYouMean(query, items, this.vocabularyCache, 0.35);
                
                return {
                    items: paginated,
                    did_you_mean,
                    total_pages,
                    total_items,
                    current_page: page
                };
            }),
            catchError(() => of({ items: [], did_you_mean: null, total_pages: 0, total_items: 0, current_page: 1 }))
        );
    }

    private matchItems(items: any[], query: string): any[] {
        return items.filter((p: any) => {
            if (!p) return false;
            
            const checks = [
                (p.name || '').toString().toLowerCase(),
                (p.short_desc || p.brief_desc || p.summary || '').toString().toLowerCase(),
                (p.sku || '').toString().toLowerCase(),
                (p.datatype || '').toString().toLowerCase(),
                (p.domain || p.domain_name || '').toString().toLowerCase(),
                p.data_steward && ((p.data_steward.name || '').toString().toLowerCase() || (p.data_steward.email || '').toString().toLowerCase()),
                p.poc_name && ((p.poc_name.name || '').toString().toLowerCase() || (p.poc_name.email || '').toString().toLowerCase())
            ].filter(Boolean);

            return checks.some(check => check.includes(query));
        });
    }

    // private buildFilters(items: any[]): Filter[] {
    //     const filters: Filter[] = [];
    //     const datatypeMap = new Map<string, number>();
    //     const domainMap = new Map<string, number>();
    //     const classificationMap = new Map<string, number>();

    //     items.forEach(item => {
    //         if (item.datatype) datatypeMap.set(item.datatype, (datatypeMap.get(item.datatype) || 0) + 1);
    //         if (item.domain || item.domain_name) {
    //             const key = item.domain || item.domain_name;
    //             domainMap.set(key, (domainMap.get(key) || 0) + 1);
    //         }
    //         if (item.classification) classificationMap.set(item.classification, (classificationMap.get(item.classification) || 0) + 1);
    //     });

    //     if (datatypeMap.size > 0) {
    //         filters.push({
    //             type: 'check', slug: 'datatype', name: 'Datatypes', value: [],
    //             items: Array.from(datatypeMap.entries())
    //                 .map(([name, count]) => ({ slug: name, name, count }))
    //                 .sort((a, b) => b.count - a.count)
    //         });
    //     }
    //     if (domainMap.size > 0) {
    //         filters.push({
    //             type: 'check', slug: 'domain', name: 'Domains', value: [],
    //             items: Array.from(domainMap.entries())
    //                 .map(([name, count]) => ({ slug: name, name, count }))
    //                 .sort((a, b) => b.count - a.count)
    //         });
    //     }
    //     if (classificationMap.size > 0) {
    //         filters.push({
    //             type: 'check', slug: 'classification', name: 'Classifications', value: [],
    //             items: Array.from(classificationMap.entries())
    //                 .map(([name, count]) => ({ slug: name, name, count }))
    //                 .sort((a, b) => b.count - a.count)
    //         });
    //     }

    //     return filters;
    // }

    private incrementMapEntry(map: Map<string, number>, value: string | null): void {
        if (value) {
            map.set(value, (map.get(value) || 0) + 1);
        }
    }

    private createCheckFilter(slug: string, name: string, map: Map<string, number>): CheckFilter {
        return {
            type: 'check',
            slug,
            name,
            items: Array.from(map.entries())
                .map(([name, count]) => ({ slug: name, name, count }))
                .sort((a, b) => b.count - a.count),
            value: []
        } as CheckFilter;
    }

    getShopProductsList(domainSlug: string | null, options: ListOptions): Observable<ProductsList> {
        return this.http.get<any>('http://localhost:8000/marketplace/api/products-json/').pipe(
            map(response => {
                let items: any[] = Array.isArray(response) ? response : (response.items || []);

                items = this.filterByDomain(items, domainSlug);
                items = this.filterByValues(items, options.filterValues);
                items = this.sortItems(items, options.sort);

                const { paginatedItems, total, pages, from, to } = this.paginateItems(items, options.page, options.limit);

                const resultFilters = response.filters?.length ? response.filters : this.buildFilters(items);

                return {
                    items: paginatedItems,
                    total,
                    page: options.page || 1,
                    limit: options.limit || 12,
                    sort: options.sort || 'default',
                    filters: resultFilters,
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

    // getSubdomainProducts(subdomainSlug: string, options: ListOptions): Observable<ProductsList> {
    //     return this.loadLocalProducts().pipe(
    //         map(items => {
    //             const matching = items.filter(item =>
    //                 item.subdomain_2_slug === subdomainSlug &&
    //                 (!item.subdomain_3_slug || item.subdomain_3_slug === '' || item.subdomain_3_slug === null)
    //             );

    //             // Only show products if there's more than one
    //             const filtered = matching.length > 1 ? matching : [];

    //             if (options.sort === 'name_asc') {
    //                 filtered.sort((a, b) => a.name.localeCompare(b.name));
    //             } else if (options.sort === 'name_desc') {
    //                 filtered.sort((a, b) => b.name.localeCompare(a.name));
    //             }

    //             const total = filtered.length;
    //             const limit = options.limit || 12;
    //             const page = options.page || 1;
    //             const pages = Math.ceil(total / limit);
    //             const from = (page - 1) * limit;
    //             const to = Math.min(from + limit, total);

    //             // Build filters from the filtered items so the sidebar works
    //             const filters = this.buildFilters(filtered);

    //             return {
    //                 items: filtered.slice(from, to),
    //                 total,
    //                 page,
    //                 limit,
    //                 sort: options.sort || 'default',
    //                 filters,
    //                 filterValues: options.filterValues || {},
    //                 pages,
    //                 from: from + 1,
    //                 to
    //             };
    //         }),
    //         catchError(() => of({
    //             items: [], total: 0, page: 1, limit: 12, sort: 'default',
    //             filters: [], filterValues: {}, pages: 1, from: 1, to: 0
    //         }))
    //     );
    // }

    // getDeepestProducts(subdomain2Slug: string, options: ListOptions): Observable<ProductsList> {
    //     return this.loadLocalProducts().pipe(
    //         map(items => {
    //             const matching = items.filter(item =>
    //                 item.subdomain_2_slug === subdomain2Slug &&
    //                 item.subdomain_3_slug &&
    //                 item.subdomain_3_slug !== '' &&
    //                 item.domain_slug &&
    //                 item.domain_slug !== ''
    //             );

    //             const filtered = matching.length > 1 ? matching : [];

    //             if (options.sort === 'name_asc') {
    //                 filtered.sort((a, b) => a.name.localeCompare(b.name));
    //             } else if (options.sort === 'name_desc') {
    //                 filtered.sort((a, b) => b.name.localeCompare(a.name));
    //             }

    //             const total = filtered.length;
    //             const limit = options.limit || 12;
    //             const page = options.page || 1;
    //             const pages = Math.ceil(total / limit);
    //             const from = (page - 1) * limit;
    //             const to = Math.min(from + limit, total);

    //             return {
    //                 items: filtered.slice(from, to),
    //                 total,
    //                 page,
    //                 limit,
    //                 sort: options.sort || 'default',
    //                 filters: this.buildFilters(filtered),
    //                 filterValues: options.filterValues || {},
    //                 pages,
    //                 from: from + 1,
    //                 to
    //             };
    //         }),
    //         catchError(() => of({
    //             items: [], total: 0, page: 1, limit: 12, sort: 'default',
    //             filters: [], filterValues: {}, pages: 1, from: 1, to: 0
    //         }))
    //     );
    // }

        /**
     * Returns products that belong ONLY to a subdomain_2 (not subdomain_3).
     * If fewer than 2 products match, returns an empty list.
     * Uses the local cache for performance.
     */
    getSubdomainProducts(subdomainSlug: string, options: ListOptions): Observable<ProductsList> {
        return this.loadLocalProducts().pipe(
            map(items => {
                const matching = items.filter(item =>
                    item.subdomain_2_slug === subdomainSlug &&
                    (!item.subdomain_3_slug || item.subdomain_3_slug === '' || item.subdomain_3_slug === null)
                );

                const filtered = matching;

                if (options.sort === 'name_asc') {
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                } else if (options.sort === 'name_desc') {
                    filtered.sort((a, b) => b.name.localeCompare(a.name));
                }

                const total = filtered.length;
                const limit = options.limit || 12;
                const page = options.page || 1;
                const pages = Math.ceil(total / limit);
                const from = (page - 1) * limit;
                const to = Math.min(from + limit, total);

                return {
                    items: filtered.slice(from, to),
                    total,
                    page,
                    limit,
                    sort: options.sort || 'default',
                    filters: this.buildFilters(filtered),
                    filterValues: options.filterValues || {},
                    pages,
                    from: from + 1,
                    to
                };
            }),
            catchError(() => of({
                items: [], total: 0, page: 1, limit: 12, sort: 'default',
                filters: [], filterValues: {}, pages: 1, from: 1, to: 0
            }))
        );
    }

    /**
     * Returns products that have all three hierarchy levels (domain, subdomain_2, subdomain_3)
     * populated AND match the given subdomain_2 slug. Used by SubdomainsTwoComponent.
     */
    getDeepestProducts(subdomain2Slug: string, options: ListOptions): Observable<ProductsList> {
        return this.loadLocalProducts().pipe(
            map(items => {
                const matching = items.filter(item =>
                    item.subdomain_2_slug === subdomain2Slug &&
                    item.subdomain_3_slug &&
                    item.subdomain_3_slug !== '' &&
                    item.domain_slug &&
                    item.domain_slug !== ''
                );

                const filtered = matching.length > 1 ? matching : [];

                if (options.sort === 'name_asc') {
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                } else if (options.sort === 'name_desc') {
                    filtered.sort((a, b) => b.name.localeCompare(a.name));
                }

                const total = filtered.length;
                const limit = options.limit || 12;
                const page = options.page || 1;
                const pages = Math.ceil(total / limit);
                const from = (page - 1) * limit;
                const to = Math.min(from + limit, total);

                return {
                    items: filtered.slice(from, to),
                    total,
                    page,
                    limit,
                    sort: options.sort || 'default',
                    filters: this.buildFilters(filtered),
                    filterValues: options.filterValues || {},
                    pages,
                    from: from + 1,
                    to
                };
            }),
            catchError(() => of({
                items: [], total: 0, page: 1, limit: 12, sort: 'default',
                filters: [], filterValues: {}, pages: 1, from: 1, to: 0
            }))
        );
    }

    private buildFilters(items: any[]): Filter[] {
        const filters: Filter[] = [];
        const datatypeMap = new Map<string, number>();
        const domainMap = new Map<string, number>();
        const classificationMap = new Map<string, number>();

        items.forEach(item => {
            if (item.datatype) datatypeMap.set(item.datatype, (datatypeMap.get(item.datatype) || 0) + 1);
            if (item.domain || item.domain_name) {
                const key = item.domain || item.domain_name;
                domainMap.set(key, (domainMap.get(key) || 0) + 1);
            }
            if (item.classification) classificationMap.set(item.classification, (classificationMap.get(item.classification) || 0) + 1);
        });

        if (datatypeMap.size > 0) {
            filters.push({
                type: 'check', slug: 'datatype', name: 'Datatypes', value: [],
                items: Array.from(datatypeMap.entries())
                    .map(([name, count]) => ({ slug: name, name, count }))
                    .sort((a, b) => b.count - a.count)
            });
        }
        if (domainMap.size > 0) {
            filters.push({
                type: 'check', slug: 'domain', name: 'Domains', value: [],
                items: Array.from(domainMap.entries())
                    .map(([name, count]) => ({ slug: name, name, count }))
                    .sort((a, b) => b.count - a.count)
            });
        }
        if (classificationMap.size > 0) {
            filters.push({
                type: 'check', slug: 'classification', name: 'Classifications', value: [],
                items: Array.from(classificationMap.entries())
                    .map(([name, count]) => ({ slug: name, name, count }))
                    .sort((a, b) => b.count - a.count)
            });
        }

        return filters;
    }
    
    getProductsList(domainSlug: string | null, options: ListOptions): Observable<ProductsList> {
        return this.loadAllProducts().pipe(
            map(allItems => {
                const processedFilters = this.preprocessFilterValues(options.filterValues);
                
                let items = allItems.filter(item => this.matchesAllFilters(item, domainSlug, processedFilters));
                items = this.sortItems(items, options.sort);

                const { paginatedItems, total, pages, from, to } = this.paginateItems(items, options.page, options.limit);
                const filters = this.buildFilters(items);

                return {
                    items: paginatedItems,
                    total,
                    page: options.page || 1,
                    limit: options.limit || 12,
                    sort: options.sort || 'default',
                    filters,
                    filterValues: options.filterValues || {},
                    pages,
                    from: from + 1,
                    to
                };
            })
        );
    }

    private preprocessFilterValues(filterValues?: { [k: string]: string }): Map<string, Set<string>> {
        const processed = new Map<string, Set<string>>();
        if (!filterValues) return processed;

        Object.entries(filterValues).forEach(([filterSlug, valueStr]) => {
            if (valueStr && valueStr.trim() !== '') {
                const values = valueStr.split(',').map(v => v.trim().toLowerCase());
                processed.set(filterSlug, new Set(values));
            }
        });
        
        return processed;
    }

    private filterByDomain(items: any[], domainSlug: string | null): any[] {
        if (!domainSlug || domainSlug === 'all' || domainSlug === '') {
            return items;
        }
        
        return items.filter(item =>
            item.domain_slug === domainSlug ||
            item.subdomain_2_slug === domainSlug ||
            item.subdomain_3_slug === domainSlug
        );
    }

    private filterByValues(items: any[], filterValues?: { [k: string]: string }): any[] {
        if (!filterValues) return items;

        const processedFilters = this.preprocessFilterValues(filterValues);
        return items.filter(item => this.matchesAllFilters(item, null, processedFilters));
    }

    private matchesAllFilters(item: any, domainSlug: string | null, processedFilters: Map<string, Set<string>>): boolean {
        if (domainSlug && domainSlug !== 'all' && domainSlug !== '') {
            if (item.domain_slug !== domainSlug &&
                item.subdomain_2_slug !== domainSlug &&
                item.subdomain_3_slug !== domainSlug) {
                return false;
            }
        }

        for (const [filterSlug, selectedValues] of processedFilters) {
            const itemValue = (item[filterSlug] || item[`${filterSlug}_slug`] || '').toString().toLowerCase();
            if (!selectedValues.has(itemValue)) {
                return false;
            }
        }
        
        return true;
    }

    private sortItems(items: any[], sort?: string): any[] {
        if (sort === 'name_asc') {
            return items.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sort === 'name_desc') {
            return items.sort((a, b) => b.name.localeCompare(a.name));
        }
        return items;
    }

    private paginateItems(items: any[], page?: number, limit?: number): { paginatedItems: any[], total: number, pages: number, from: number, to: number } {
        const total = items.length;
        const itemLimit = limit || 12;
        const itemPage = page || 1;
        const pages = Math.ceil(total / itemLimit);
        const from = (itemPage - 1) * itemLimit;
        const to = Math.min(from + itemLimit, total);
        const paginatedItems = items.slice(from, to);

        return { paginatedItems, total, pages, from, to };
    }

    getRelatedProducts(product: Partial<Product>, limit: number = 8): Observable<Product[]> {
        let params = new HttpParams().set('limit', limit.toString());
        if (product?.slug) {
            params = params.set('for', product.slug);
        }
        return this.http.get<Product[]>(`${this.apiBase}/products/related/`, { params });
    }

    getDomainsBySlug(slugs: string[], depth: number = 0): Observable<Domain[]> {
        let params = new HttpParams()
            .set('slugs', slugs.join(','))
            .set('depth', depth.toString());
        return this.http.get<Domain[]>(`${this.apiBase}/domains/`, { params });
    }

    getSuggestions(query: string, limit = 8, opts: any = {}): Observable<any> {
        const key = `${opts.domain || 'all'}::${query}::${limit}`;
        const now = Date.now();
        const cached = this.suggestionsCache.get(key);
        
        if (cached && (now - cached.ts) < this.cacheTTL) {
            return of(cached.value);
        }

        let params = new HttpParams().set('q', query).set('limit', String(limit));
        if (opts.domain) params = params.set('domain', opts.domain);

        return this.http.get<any>(`${this.apiBase}/search/suggestions/`, { params }).pipe(
            map(res => {
                const items = (res.items || []).map((p: any) => this.normalizeSuggestion(p));
                const did_you_mean = this.computeDidYouMean(query, items, this.vocabularyCache, 0.35);
                
                const result = {
                    items,
                    total_items: res.total_items || 0,
                    did_you_mean
                };

                this.suggestionsCache.set(key, { ts: now, value: result });
                this.pruneCache(this.suggestionsCache, 200);
                
                return result;
            }),
            catchError(() => of({ items: [], total_items: 0, did_you_mean: null }))
        );
    }

    private pruneCache(cache: Map<any, any>, maxSize: number): void {
        if (cache.size > maxSize) {
            const oldest = Array.from(cache.entries())
                .sort((a, b) => a[1].ts - b[1].ts)[0];
            cache.delete(oldest[0]);
        }
    }

    private normalizeSuggestion(p: any): any {
        return {
            ...p,
            images: Array.isArray(p.images) && p.images.length
                ? p.images.map((img: any) => this.buildImageUrl(img))
                : (p.image ? [this.buildImageUrl(p.image)] : ['assets/images/product-placeholder.png']),
            data_steward_name: p.data_steward?.name || p.data_steward_name || '',
            data_steward_email: p.data_steward?.email || p.data_steward_email || '',
            poc_name: p.poc_name?.name || (typeof p.poc_name === 'string' ? p.poc_name : '') || '',
            poc_email: p.poc_name?.email || p.poc_email || '',
            short_desc: p.short_desc || p.brief_desc || p.summary || '',
            sku: p.sku || p.product_sku || '',
            slug: p.slug || p.product_slug || '',
            domain: p.domain || p.domain_name || '',
            owner: p.owner || p.owner_name || p.business_contact_name || '',
            tags: p.tags || p.keywords || [],
            id: p.id ?? p.product_id ?? p.sku ?? p.slug ?? null
        };
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

    private computeDidYouMean(query: string, items: any[], vocabulary: Set<string>, threshold = 0.35): string | null {
        if (!query || query.trim().length < 1) return null;

        const qLower = query.toString().toLowerCase().trim();
        const spellCorrection = this.checkSpelling(qLower, vocabulary, threshold);
        
        if (spellCorrection) {
            return spellCorrection;
        }

        if (!items || items.length === 0) return null;

        return this.fuzzyMatchName(items, qLower, threshold);
    }

    private fuzzyMatchName(items: any[], qLower: string, threshold: number): string | null {
        const options: Fuse.IFuseOptions<any> = {
            includeScore: true,
            shouldSort: true,
            threshold,
            keys: [
                { name: 'name', weight: 0.7 },
                { name: 'short_desc', weight: 0.12 },
                { name: 'datatype', weight: 0.06 },
                { name: 'classification', weight: 0.03 },
                { name: 'tags', weight: 0.04 },
                { name: 'data_steward_name', weight: 0.03 },
                { name: 'poc_name', weight: 0.02 }
            ]
        };

        try {
            const fuse = new Fuse(items, options);
            const results = fuse.search(qLower);
            
            if (!results || results.length === 0) return null;

            const best = results[0];
            if (best?.score != null && best.score <= threshold) {
                const candidate = best.item?.name || best.item?.slug || null;
                if (!candidate || candidate.toString().toLowerCase().trim() === qLower) {
                    return null;
                }
                return candidate;
            }
            
            return null;
        } catch {
            return null;
        }
    }

    private buildVocabulary(items: any[]): void {
        this.vocabularyCache.clear();
        
        items.forEach((p: any) => {
            this.extractWords(p.name, this.vocabularyCache);
            this.extractWords(p.short_desc || p.brief_desc || '', this.vocabularyCache);
            this.extractWords(p.sku || '', this.vocabularyCache);
            this.extractWords(p.datatype || '', this.vocabularyCache);
            this.extractWords(p.domain || p.domain_name || '', this.vocabularyCache);
            
            if (p.data_steward?.name) this.extractWords(p.data_steward.name, this.vocabularyCache);
            if (p.poc_name?.name) this.extractWords(p.poc_name.name, this.vocabularyCache);
            
            const tags = p.tags || p.keywords || [];
            if (Array.isArray(tags)) {
                tags.forEach((t: any) => this.extractWords(t.name || t, this.vocabularyCache));
            }
        });
    }

    private extractWords(text: string, vocab: Set<string>): void {
        if (!text) return;
        
        const words = text.toString().toLowerCase().split(/\s+/).filter(w => w.length > 0);
        words.forEach(word => {
            const cleaned = word.replace(/[^\w]/g, '');
            if (cleaned.length > 1) vocab.add(cleaned);
        });
    }

    private checkSpelling(query: string, vocabulary: Set<string>, threshold: number): string | null {
        if (!query || query.length < 2 || vocabulary.size === 0) {
            return null;
        }

        const vocabArray = Array.from(vocabulary).map(word => ({ word }));
        const options: Fuse.IFuseOptions<any> = {
            includeScore: true,
            shouldSort: true,
            threshold,
            keys: ['word']
        };

        try {
            const fuse = new Fuse(vocabArray, options);
            const results = fuse.search(query);
            
            if (!results || results.length === 0) {
                return null;
            }

            const best = results[0];
            if (best?.score != null && best.score <= threshold) {
                const suggestion = best.item?.word;
                if (suggestion && suggestion !== query) {
                    return suggestion;
                }
            }
            
            return null;
        } catch (e) {
            console.error('checkSpelling error:', e);
            return null;
        }
    }

    private rankResults(items: any[], query: string): any[] {
        const q = query.toLowerCase();
        
        return items.sort((a, b) => {
            let scoreA = 0;
            let scoreB = 0;

            // ✅ Rank 1: name (highest priority)
            if ((a.name || '').toLowerCase().includes(q)) scoreA += 100;
            if ((b.name || '').toLowerCase().includes(q)) scoreB += 100;

            // ✅ Rank 2: short_desc
            if ((a.short_desc || '').toLowerCase().includes(q)) scoreA += 80;
            if ((b.short_desc || '').toLowerCase().includes(q)) scoreB += 80;

            // ✅ Rank 3: datatype
            if ((a.datatype || '').toLowerCase().includes(q)) scoreA += 60;
            if ((b.datatype || '').toLowerCase().includes(q)) scoreB += 60;

            // ✅ Rank 4: data_steward
            if ((a.data_steward?.name || '').toLowerCase().includes(q) || (a.data_steward?.email || '').toLowerCase().includes(q)) scoreA += 40;
            if ((b.data_steward?.name || '').toLowerCase().includes(q) || (b.data_steward?.email || '').toLowerCase().includes(q)) scoreB += 40;

            // ✅ Rank 5: poc_name
            if ((a.poc_name?.name || '').toLowerCase().includes(q) || (a.poc_name?.email || '').toLowerCase().includes(q)) scoreA += 30;
            if ((b.poc_name?.name || '').toLowerCase().includes(q) || (b.poc_name?.email || '').toLowerCase().includes(q)) scoreB += 30;

            // ✅ Rank 6: classification
            if ((a.classification || '').toLowerCase().includes(q)) scoreA += 20;
            if ((b.classification || '').toLowerCase().includes(q)) scoreB += 20;

            // ✅ Rank 7: sku (lowest priority)
            if ((a.sku || '').toLowerCase().includes(q)) scoreA += 10;
            if ((b.sku || '').toLowerCase().includes(q)) scoreB += 10;

            return scoreB - scoreA;
        });
    }
}