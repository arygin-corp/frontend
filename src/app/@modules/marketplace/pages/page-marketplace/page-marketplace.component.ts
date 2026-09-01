import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ShopSidebarService } from '../../services/shop-sidebar.service';
import { PageMarketplaceService } from '../../services/page-marketplace.service';
import { PageDomainService } from '../../services/page-domain.service';
import { Link } from '../../../../@shared/interfaces/link';
import { RootService } from '../../../../@shared/services/root.service';
import { of, Subject } from 'rxjs';
import { debounce, mergeMap, takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';
import { parseProductsListParams } from '../../resolvers/products-list-resolver.service';
import { ShopService } from '../../../../@shared/api/shop.service';
// import { Domain } from '../../../../@shared/interfaces/domain';

@Component({
    selector: 'app-grid',
    templateUrl: './page-marketplace.component.html',
    styleUrls: ['./page-marketplace.component.scss'],
    providers: [
        {provide: PageDomainService, useExisting: PageMarketplaceService},
        {provide: PageMarketplaceService, useClass: PageMarketplaceService},
        {provide: ShopSidebarService, useClass: ShopSidebarService},
    ]
})
export class PageMarketplaceComponent implements OnDestroy {
    destroy$: Subject<void> = new Subject<void>();
    currentGrid: 'grid-3-sidebar' | 'grid-4-full' | 'grid-5-full' = 'grid-3-sidebar';
    columns: 3|4|5 = 3;
    viewMode: 'grid'|'grid-with-features'|'list' = 'grid';
    sidebarPosition: 'start'|'end' = 'start';
    breadcrumbs: Link[] = [];
    pageHeader = '';

    constructor(
        private root: RootService,
        private router: Router,
        private route: ActivatedRoute,
        private pageService: PageMarketplaceService,
        private shop: ShopService,
        private location: Location,
    ) {
        this.route.data.subscribe(data => {
            this.breadcrumbs = [
                {label: 'Domains', url: this.root.home()},
                {label: 'Marketplace', url: this.root.shop()},
            ];
            
            const slug = this.getDomainSlug();
            this.pageHeader = !slug ? 'Shop' : (data.domain?.name || 'Marketplace');

            // THIS IS THE KEY FIX — actively fetch products on initialization
            this.getMarketplaceProducts();
            // this.pageService.setList(data.products || { items: [], total: 0 });
        });

        this.route.queryParams.subscribe(queryParams => {
            this.pageService.setOptions(parseProductsListParams(queryParams), false);
        });

        this.pageService.optionsChange$.pipe(
            debounce(() => of(null)), // No delay needed as filters are removed
            mergeMap(() => {
                this.updateUrl();
                this.pageService.setIsLoading(true);

                // Overriding filterValues to be empty to prevent blocking products
                const options = { ...this.pageService.options, filterValues: {} };

                return this.shop.getProductsList(
                    this.getDomainSlug(),
                    options,
                ).pipe(
                    takeUntil(this.pageService.optionsChange$)
                );
            }),
            takeUntil(this.destroy$),
        ).subscribe(list => {
            this.pageService.setList(list);
            this.pageService.setIsLoading(false);
        });

        this.pageService.optionsChange$.pipe(
            mergeMap(() => {
                return this.shop.getProductsList(
                    this.getDomainSlug(),   // null for root marketplace page
                    { ...this.pageService.options, filterValues: {} },
                );
            }),
        ).subscribe(list => {
            this.pageService.setList(list);  // <-- products end up here
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    updateUrl(): void {
        const tree = this.router.parseUrl(this.router.url);
        tree.queryParams = this.getQueryParams();
        this.location.replaceState(tree.toString());
    }

    getQueryParams(): Params {
        const params: Params = {};
        const options =  this.pageService.options;

        // Only keep pagination and sorting, removed all filter logic
        if ('page' in options && options.page !== 1) params.page = options.page;
        if ('limit' in options && options.limit !== 12) params.limit = options.limit;
        if ('sort' in options && options.sort !== 'default') params.sort = options.sort;

        return params;
    }

    getDomainSlug(): string|null {
        return this.route.snapshot.params.domainSlug || this.route.snapshot.data.domainSlug || 'all';
    }

    getProductsViewLayout(): 'grid-3-sidebar'|'grid-4-full'|'grid-5-full' {
        return ('grid-' + this.columns + '-full') as any;
    }

    // NEW METHOD — fetches all marketplace products and populates the list
    private getMarketplaceProducts(): void {
        this.pageService.setIsLoading(true);

        this.shop.getShopProductsList(
            this.getDomainSlug(),
            { page: 1, limit: 12, sort: 'default' },
        ).subscribe(list => {
            this.pageService.setList(list);
            this.pageService.setIsLoading(false);
        });
    }
    
    get offcanvasMode(): 'always' | 'mobile' {
        return this.currentGrid === 'grid-4-full' ? 'mobile' : 'mobile';
    }

    onGridChange(grid: 'grid-3-sidebar' | 'grid-4-full' | 'grid-5-full'): void {
        this.currentGrid = grid;
    }
}