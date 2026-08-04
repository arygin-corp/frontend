import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../@shared/shared.module';
import { NewsroomRoutingModule } from './newsroom-routing.module';
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

@NgModule({
  declarations: [
    LayoutComponent,
    NewsroomComponent,
    PageFeaturePostComponent,
    PageFeaturePostDetailsComponent,
    PageUpdatePostComponent,
    PageUpdatePostDetailsComponent,
    PageTrendingPostComponent,
    PageTrendingPostDetailsComponent,
    PageSecurityPostComponent,
    PageSecurityPostDetailsComponent
  ],
  exports: [
    LayoutComponent,
    NewsroomComponent,
    PageFeaturePostComponent,
    PageFeaturePostDetailsComponent,
    PageUpdatePostComponent,
    PageUpdatePostDetailsComponent,
    PageTrendingPostComponent,
    PageTrendingPostDetailsComponent,
    PageSecurityPostComponent,
    PageSecurityPostDetailsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NewsroomRoutingModule,
    SharedModule
  ]
})
export class NewsroomModule { }