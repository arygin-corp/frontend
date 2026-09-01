import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { ShopSidebarService } from '../../services/shop-sidebar.service';
import { PageMarketplaceService } from '../../services/page-marketplace.service';
import { PageDomainService } from '../../services/page-domain.service';
import { Link } from '../../../../@shared/interfaces/link';
import { RootService } from '../../../../@shared/services/root.service';
import { of, Subject } from 'rxjs';
import { debounce, mergeMap, takeUntil, filter } from 'rxjs/operators';
import { Location } from '@angular/common';
import { parseProductsListParams } from '../../resolvers/products-list-resolver.service';
import { ShopService } from '../../../../@shared/api/shop.service';

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
    columns: 3 | 4 | 5 = 3;
    viewMode: 'grid' | 'grid-with-features' | 'list' = 'grid';
    sidebarPosition: 'start' | 'end' = 'start';
    breadcrumbs: Link[] = [];
    pageHeader = '';

    private subdomainSlug: string | null = null;
    private subdomain2Slug: string | null = null;

    constructor(
      private root: RootService,
      private router: Router,
      private route: ActivatedRoute,
      private pageService: PageMarketplaceService,
      private shop: ShopService,
      private location: Location,
  ) {
      this.route.data.subscribe(data => {
          // Re-read matrix params on route data change (initial load)
          this.detectParamsAndLoad(data);
      });

      // Listen for SPA navigation events — this fires when matrix params change
      // even though the route data hasn't changed
      this.router.events
          .pipe(filter(event => event instanceof NavigationEnd))
          .subscribe(() => {
              this.subdomainSlug = this.getSubdomainFromUrl();
              this.subdomain2Slug = this.getSubdomain2FromUrl();

              // Re-run the data subscription logic
              const currentData = this.route.snapshot.data;
              this.detectParamsAndLoad(currentData);
          });

      this.route.queryParams.subscribe(queryParams => {
          this.pageService.setOptions(parseProductsListParams(queryParams), false);
      });

      this.pageService.optionsChange$.pipe(
          filter(() => !this.subdomainSlug && !this.subdomain2Slug),
          debounce(() => of(null)),
          mergeMap(() => {
              this.updateUrl();
              this.pageService.setIsLoading(true);
              const options = { ...this.pageService.options, filterValues: {} };
              return this.shop.getProductsList(
                  this.getDomainSlug(),
                  options,
              ).pipe(takeUntil(this.pageService.optionsChange$));
          }),
          takeUntil(this.destroy$),
      ).subscribe(list => {
          this.pageService.setList(list);
          this.pageService.setIsLoading(false);
      });

      this.pageService.optionsChange$.pipe(
          filter(() => !this.subdomainSlug && !this.subdomain2Slug),
          mergeMap(() => {
              return this.shop.getProductsList(
                  this.getDomainSlug(),
                  { ...this.pageService.options, filterValues: {} },
              );
          }),
      ).subscribe(list => {
          this.pageService.setList(list);
      });
    }

    private detectParamsAndLoad(data: any): void {
      this.subdomainSlug = this.getSubdomainFromUrl();
      this.subdomain2Slug = this.getSubdomain2FromUrl();

      this.breadcrumbs = [
          {label: 'Domains', url: this.root.home()},
          {label: 'Marketplace', url: this.root.shop()},
      ];

      if (this.subdomainSlug && this.subdomain2Slug) {
          this.pageHeader = this.subdomain2Slug.replace(/-/g, ' ');
          this.breadcrumbs.push({label: this.pageHeader, url: ''});
          this.getDeepestProducts();
      } else if (this.subdomainSlug) {
          this.pageHeader = this.subdomainSlug.replace(/-/g, ' ');
          this.breadcrumbs.push({label: this.pageHeader, url: ''});
          this.getSubdomainProducts();
      } else {
          const slug = this.getDomainSlug();
          this.pageHeader = !slug ? 'Shop' : (data.domain?.name || 'Marketplace');
          this.getMarketplaceProducts();
      }
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
        const options = this.pageService.options;
        if ('page' in options && options.page !== 1) params.page = options.page;
        if ('limit' in options && options.limit !== 12) params.limit = options.limit;
        if ('sort' in options && options.sort !== 'default') params.sort = options.sort;
        return params;
    }

    getDomainSlug(): string | null {
        return this.route.snapshot.params.domainSlug || this.route.snapshot.data.domainSlug || 'all';
    }

    getProductsViewLayout(): 'grid-3-sidebar' | 'grid-4-full' | 'grid-5-full' {
        return ('grid-' + this.columns + '-full') as any;
    }

    get offcanvasMode(): 'always' | 'mobile' {
        return this.currentGrid === 'grid-4-full' ? 'mobile' : 'mobile';
    }

    onGridChange(grid: 'grid-3-sidebar' | 'grid-4-full' | 'grid-5-full'): void {
        this.currentGrid = grid;
    }

    private getSubdomainFromUrl(): string | null {
        const queryParam = this.route.snapshot.queryParams.subdomain;
        if (queryParam) return queryParam;

        const tree = this.router.parseUrl(this.router.url);
        const primary = tree.root.children['primary'];
        if (primary && primary.segments.length > 0) {
            const params = primary.segments[0].parameters;
            if (params['subdomain']) return params['subdomain'];
        }

        return null;
    }

    private getSubdomain2FromUrl(): string | null {
        const queryParam = this.route.snapshot.queryParams.subdomain_2;
        if (queryParam) return queryParam;

        const tree = this.router.parseUrl(this.router.url);
        const primary = tree.root.children['primary'];
        if (primary && primary.segments.length > 0) {
            const params = primary.segments[0].parameters;
            if (params['subdomain_2']) return params['subdomain_2'];
        }

        return null;
    }

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

    private getSubdomainProducts(): void {
        this.pageService.setIsLoading(true);
        this.shop.getSubdomainProducts(
            this.subdomainSlug!,
            { page: 1, limit: 12, sort: 'default' },
        ).subscribe(list => {
            this.pageService.setList(list);
            this.pageService.setIsLoading(false);
        });
    }

    private getDeepestProducts(): void {
        this.pageService.setIsLoading(true);
        this.shop.getDeepestProducts(
            this.subdomain2Slug!,
            { page: 1, limit: 12, sort: 'default' },
        ).subscribe(list => {
            this.pageService.setList(list);
            this.pageService.setIsLoading(false);
        });
    }
}




// import { Component, OnDestroy } from '@angular/core';
// import { ActivatedRoute, Params, Router } from '@angular/router';
// import { ShopSidebarService } from '../../services/shop-sidebar.service';
// import { PageMarketplaceService } from '../../services/page-marketplace.service';
// import { PageDomainService } from '../../services/page-domain.service';
// import { Link } from '../../../../@shared/interfaces/link';
// import { RootService } from '../../../../@shared/services/root.service';
// import { of, Subject } from 'rxjs';
// import { debounce, mergeMap, takeUntil, filter } from 'rxjs/operators';
// import { Location } from '@angular/common';
// import { parseProductsListParams } from '../../resolvers/products-list-resolver.service';
// import { ShopService } from '../../../../@shared/api/shop.service';

// @Component({
//   selector: 'app-grid',
//   templateUrl: './page-marketplace.component.html',
//   styleUrls: ['./page-marketplace.component.scss'],
//   providers: [
//     {provide: PageDomainService, useExisting: PageMarketplaceService},
//     {provide: PageMarketplaceService, useClass: PageMarketplaceService},
//     {provide: ShopSidebarService, useClass: ShopSidebarService},
//   ]
// })
// export class PageMarketplaceComponent implements OnDestroy {
//   destroy$: Subject<void> = new Subject<void>();
//   currentGrid: 'grid-3-sidebar' | 'grid-4-full' | 'grid-5-full' = 'grid-3-sidebar';
//   columns: 3|4|5 = 3;
//   viewMode: 'grid'|'grid-with-features'|'list' = 'grid';
//   sidebarPosition: 'start'|'end' = 'start';
//   breadcrumbs: Link[] = [];
//   pageHeader = '';
//   private subdomainSlug: string | null = null;
//   private subdomain2Slug: string | null = null;

//   constructor(
//     private root: RootService,
//     private router: Router,
//     private route: ActivatedRoute,
//     private pageService: PageMarketplaceService,
//     private shop: ShopService,
//     private location: Location,
//   ) {
//     this.route.data.subscribe(data => {
//       // Re-read matrix params on every route data change (handles in-page navigation)
//       this.subdomainSlug = this.getSubdomainFromUrl();
//       this.subdomain2Slug = this.getSubdomain2FromUrl();

//       this.breadcrumbs = [
//         {label: 'Domains', url: this.root.home()},
//         {label: 'Marketplace', url: this.root.shop()},
//       ];

//       if (this.subdomainSlug && this.subdomain2Slug) {
//         this.pageHeader = this.subdomain2Slug.replace(/-/g, ' ');
//         this.breadcrumbs.push({label: this.pageHeader, url: ''});
//         this.getDeepestProducts();
//       } else if (this.subdomainSlug) {
//         this.pageHeader = this.subdomainSlug.replace(/-/g, ' ');
//         this.breadcrumbs.push({label: this.pageHeader, url: ''});
//         this.getSubdomainProducts();
//       } else {
//         const slug = this.getDomainSlug();
//         this.pageHeader = !slug ? 'Shop' : (data.domain?.name || 'Marketplace');
//         this.getMarketplaceProducts();
//       }
//     });

//     this.route.queryParams.subscribe(queryParams => {
//       if (queryParams) {
//         this.pageService.setOptions(parseProductsListParams(queryParams), false);
//       }
//     });

//     this.pageService.optionsChange$.pipe(
//       filter(() => !this.subdomainSlug && !this.subdomain2Slug),
//       debounce(() => of(null)),
//       mergeMap(() => {
//         this.updateUrl();
//         this.pageService.setIsLoading(true);
//         const options = { ...this.pageService.options, filterValues: {} };
//         return this.shop.getProductsList(
//           this.getDomainSlug(),
//           options,
//         ).pipe(takeUntil(this.pageService.optionsChange$));
//       }),
//       takeUntil(this.destroy$),
//     ).subscribe(list => {
//       this.pageService.setList(list);
//       this.pageService.setIsLoading(false);
//     });

//     this.pageService.optionsChange$.pipe(
//       filter(() => !this.subdomainSlug && !this.subdomain2Slug),
//       mergeMap(() => {
//         return this.shop.getProductsList(
//           this.getDomainSlug(),
//           { ...this.pageService.options, filterValues: {} },
//         );
//       }),
//     ).subscribe(list => {
//       this.pageService.setList(list);
//     });
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   updateUrl(): void {
//     const tree = this.router.parseUrl(this.router.url);
//     tree.queryParams = this.getQueryParams();
//     this.location.replaceState(tree.toString());
//   }

//   getQueryParams(): Params {
//     const params: Params = {};
//     const options =  this.pageService.options;
//     if ('page' in options && options.page !== 1) params.page = options.page;
//     if ('limit' in options && options.limit !== 12) params.limit = options.limit;
//     if ('sort' in options && options.sort !== 'default') params.sort = options.sort;
//     return params;
//   }

//   getDomainSlug(): string|null {
//     return this.route.snapshot.params.domainSlug || this.route.snapshot.data.domainSlug || 'all';
//   }

//   getProductsViewLayout(): 'grid-3-sidebar'|'grid-4-full'|'grid-5-full' {
//     return ('grid-' + this.columns + '-full') as any;
//   }

//   get offcanvasMode(): 'always' | 'mobile' {
//     return this.currentGrid === 'grid-4-full' ? 'mobile' : 'mobile';
//   }

//   onGridChange(grid: 'grid-3-sidebar' | 'grid-4-full' | 'grid-5-full'): void {
//     this.currentGrid = grid;
//   }

//   private getSubdomainFromUrl(): string|null {
//     const queryParam = this.route.snapshot.queryParams.subdomain;
//     if (queryParam) return queryParam;

//     const tree = this.router.parseUrl(this.router.url);
//     const primary = tree.root.children['primary'];
//     if (primary && primary.segments.length > 0) {
//       const params = primary.segments[0].parameters;
//       if (params['subdomain']) return params['subdomain'];
//     }
//     return null;
//   }

//   private getSubdomain2FromUrl(): string|null {
//     const queryParam = this.route.snapshot.queryParams.subdomain_2;
//     if (queryParam) return queryParam;

//     const tree = this.router.parseUrl(this.router.url);
//     const primary = tree.root.children['primary'];
//     if (primary && primary.segments.length > 0) {
//       const params = primary.segments[0].parameters;
//       if (params['subdomain_2']) return params['subdomain_2'];
//     }

//     return null;
//   }

//   private getMarketplaceProducts(): void {
//     this.pageService.setIsLoading(true);
//     this.shop.getShopProductsList(
//       this.getDomainSlug(),
//       { page: 1, limit: 12, sort: 'default' },
//     ).subscribe(list => {
//       this.pageService.setList(list);
//       this.pageService.setIsLoading(false);
//     });
//   }

//   private getSubdomainProducts(): void {
//     this.pageService.setIsLoading(true);
//     this.shop.getSubdomainProducts(
//       this.subdomainSlug!,
//       { page: 1, limit: 12, sort: 'default' },
//     ).subscribe(list => {
//       this.pageService.setList(list);
//       this.pageService.setIsLoading(false);
//     });
//   }

//   private getDeepestProducts(): void {
//     this.pageService.setIsLoading(true);
//     this.shop.getDeepestProducts(
//       this.subdomain2Slug!,
//       { page: 1, limit: 12, sort: 'default' },
//     ).subscribe(list => {
//       this.pageService.setList(list);
//       this.pageService.setIsLoading(false);
//     });
//   }
// }