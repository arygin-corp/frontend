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

export interface ListOptions {
    domains?: string[];
    datatypes?: string[];
    page?: number;
    limit?: number;
    sort?: string;
    filterValues?: SerializedFilterValues;
    status?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ShopService {
    private readonly apiBase = `${environment.apiUrl}/marketplace/api`;

    constructor(private http: HttpClient) { }

    /**
     * Returns paginated products list with CLIENT-SIDE filtering.
     * Restored to work with products-json for high-performance demo data listing.
     */
    getProductsList(domainSlug: string | null, options: ListOptions): Observable<ProductsList> {
        return this.http.get<any>(`${this.apiBase}/products-json/`).pipe(
            map(response => {
                // 1. Extract items from the JSON response
                let items: any[] = response.items || [];

                // 2. Filter by Domain (Category)
                if (domainSlug && domainSlug !== 'all' && domainSlug !== '') {
                    items = items.filter(item => 
                        item.domain_slug === domainSlug || 
                        item.subdomain_2_slug === domainSlug || 
                        item.subdomain_3_slug === domainSlug
                    );
                }

                // 3. Filter by additional Filter Values (Datatypes, Orgs, etc.)
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

                // 4. Client-side Sort
                if (options.sort === 'name_asc') {
                    items.sort((a, b) => a.name.localeCompare(b.name));
                } else if (options.sort === 'name_desc') {
                    items.sort((a, b) => b.name.localeCompare(a.name));
                }

                // 5. Pagination calculation
                const total = items.length;
                const limit = options.limit || 12;
                const page = options.page || 1;
                const pages = Math.ceil(total / limit);
                const from = (page - 1) * limit;
                const to = Math.min(from + limit, total);
                
                const paginatedItems = items.slice(from, to);

                // 6. Return standard ProductsList structure
                return {
                    items: paginatedItems,
                    total: total,
                    page: page,
                    limit: limit,
                    sort: options.sort || 'default',
                    filters: response.filters || [], 
                    filterValues: options.filterValues || {}, // Fix: Always provide an object to prevent crashes
                    pages: pages,
                    from: from + 1,
                    to: to
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

    /**
     * Returns search suggestions using the AI Vector endpoint.
     */
    getSuggestions(query: string, limit: number, options: { page?: number, domain?: string, datatype?: string } = {}) {
        if (!query.trim()) {
            return of({ items: [], total_pages: 1, total_items: 0 });
        }

        let params = new HttpParams()
            .set('query', query)
            .set('limit', limit.toString())
            .set('page', (options.page || 1).toString());

        if (options.domain) params = params.set('domain', options.domain);
        if (options.datatype) params = params.set('datatype', options.datatype);

        // Fix: Corrected URL path and mapped response to match component expectations
        return this.http.get<any>(`${this.apiBase}/search/suggestions/`, { params }).pipe(
            map(response => ({
                items: response.items || [],
                total_pages: response.total_pages || 1,
                total_items: response.total_items || 0,
                current_page: response.current_page || 1,
                did_you_mean: response.did_you_mean || null
            })),
            catchError(() => of({ items: [], total_pages: 1, total_items: 0 }))
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
}