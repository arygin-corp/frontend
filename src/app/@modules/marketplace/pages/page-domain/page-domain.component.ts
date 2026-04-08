import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ShopSidebarService } from '../../services/shop-sidebar.service';
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
    templateUrl: './page-domain.component.html',
    styleUrls: ['./page-domain.component.scss'],
    providers: [
        {provide: PageDomainService, useClass: PageDomainService},
        {provide: ShopSidebarService, useClass: ShopSidebarService},
    ]
})
export class PageDomainComponent implements OnDestroy {
    destroy$: Subject<void> = new Subject<void>();

    columns: 3|4|5 = 3;
    viewMode: 'grid'|'grid-with-features'|'list' = 'grid';
    sidebarPosition: 'start'|'end' = 'start';
    breadcrumbs: Link[] = [];
    pageHeader = '';

    constructor(
        private root: RootService,
        private router: Router,
        private route: ActivatedRoute,
        private pageService: PageDomainService,
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
            
            this.pageService.setList(data.products || { items: [], total: 0 });
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
        return this.route.snapshot.params.domainSlug || this.route.snapshot.data.domainSlug || null;
    }

    getProductsViewLayout(): 'grid-3-sidebar'|'grid-4-full'|'grid-5-full' {
        return ('grid-' + this.columns + '-full') as any;
    }
}