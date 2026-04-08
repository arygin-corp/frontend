import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//modules
import { Forms2Module } from './forms2/forms2.module';
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '../@shared/shared.module';
import { BlocksModule } from './../@modules/blocks/blocks.module';
import { CarouselModule } from 'ngx-owl-carousel-o';

//components
import { LeadershipComponent } from './leadership/leadership.component';
import { HackathonComponent } from './hackathon/hackathon.component';
import { RoadmapComponent } from './roadmap/roadmap.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { OrgComponent } from './org/org.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

@NgModule({
  declarations: [
    LeadershipComponent,
    HackathonComponent,
    RoadmapComponent,
    CampaignsComponent,
    OrgComponent,
    LandingPageComponent,
  ],
  exports: [
    LeadershipComponent,
    HackathonComponent,
    RoadmapComponent,
    CampaignsComponent,
    OrgComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    Forms2Module,
    SharedModule,
    CarouselModule,
    BlocksModule
  ]
})

export class PagesModule { }
