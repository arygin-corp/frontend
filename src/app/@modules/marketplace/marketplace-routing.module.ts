import { NgModule } from '@angular/core';
import { Routes, RouterModule, Data, ResolveData } from '@angular/router';
import { PageDomainComponent } from './pages/page-domain/page-domain.component';
import { PageCartComponent } from './pages/page-cart/page-cart.component';
import { PageFavoritesComponent } from './pages/page-favorites/page-favorites.component';
import { PageCheckoutComponent } from './pages/page-checkout/page-checkout.component';
import { PageCompareComponent } from './pages/page-compare/page-compare.component';
import { PageTrackOrderComponent } from './pages/page-track-order/page-track-order.component';
import { PageProductComponent } from './pages/page-product/page-product.component';
import { PageOrderSuccessComponent } from './pages/page-order-success/page-order-success.component';
import { PageRequestFormComponent } from './pages/page-request-form/page-request-form.component';
import { CheckoutGuard } from './guards/checkout.guard';

// Resolvers
import { ProductsListResolverService } from './resolvers/products-list-resolver.service';
import { DomainResolverService } from './resolvers/domain-resolver.service';
import { ProductResolverService } from './resolvers/product-resolver.service';

const domainPageData: Data = { 
    columns: 3, 
    viewMode: 'list', 
    sidebarPosition: 'start' 
};

const domainPageResolvers: ResolveData = { 
    domain: DomainResolverService, 
    products: ProductsListResolverService 
};

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: PageDomainComponent,
        data: domainPageData,
        // resolve: domainPageResolvers,
    },
    {
        path: 'user/compare',
        component: PageCompareComponent
    },
    {
        path: 'user/favorites',
        component: PageFavoritesComponent
    },
    {
        path: 'product/request',
        component: PageRequestFormComponent,
    },
   {
        path: 'product/:productSlug', // Changed from 'marketplace/product/:productSlug'
        component: PageProductComponent,
        data: {
            layout: 'standard',
            sidebarPosition: 'start'
        },
        resolve: {
            product: ProductResolverService
        },
    },
    {
        path: 'order',
        children: [
            { path: 'cart', component: PageCartComponent },
            { path: 'cart/checkout', component: PageCheckoutComponent, canActivate: [CheckoutGuard] },
            { path: 'cart/checkout/success', component: PageOrderSuccessComponent },
            { path: 'track-request', component: PageTrackOrderComponent }
        ]
    },
    {
        path: '', 
        component: PageDomainComponent,
        data: domainPageData,
        resolve: domainPageResolvers,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class MarketplaceRoutingModule { }