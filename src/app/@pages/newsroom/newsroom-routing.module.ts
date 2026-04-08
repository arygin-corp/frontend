import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { NewsroomComponent } from './newsroom.component';
import { PageFeaturePostComponent } from './pages/page-feature-post/page-feature-post.component';
import { PageFeaturePostDetailsComponent } from './pages/page-feature-post-details/page-feature-post-details.component';
import { PageUpdatePostComponent } from './pages/page-update-post/page-update-post.component';
import { PageUpdatePostDetailsComponent } from './pages/page-update-post-details/page-update-post-details.component';
import { PageTrendingPostComponent } from './pages/page-trending-post/page-trending-post.component';
import { PageTrendingPostDetailsComponent } from './pages/page-trending-post-details/page-trending-post-details.component';
import { PageSecurityPostComponent } from './pages/page-security-post/page-security-post.component';
import { PageSecurityPostDetailsComponent } from './pages/page-security-post-details/page-security-post-details.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'home'
            },
            {
                path: '',
                component: NewsroomComponent
            },
            {
                path: 'features',
                component: PageFeaturePostComponent
            },
            {
                path: 'feature/details/:id',
                component: PageFeaturePostDetailsComponent
            },
            {
                path: 'updates',
                component: PageUpdatePostComponent
            },
            {
                path: 'update/details/:id',
                component: PageUpdatePostDetailsComponent
            },
            {
                path: 'trending',
                component: PageTrendingPostComponent
            },
            {
                path: 'trending/details/:id',
                component: PageTrendingPostDetailsComponent
            },
            {
                path: 'security',
                component: PageSecurityPostComponent
            },
            {
                path: 'security/details/:id',
                component: PageSecurityPostDetailsComponent
            },
        ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsroomRoutingModule { }
