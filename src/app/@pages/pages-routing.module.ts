import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//components
import { LeadershipComponent } from './leadership/leadership.component';
import { RoadmapComponent } from './roadmap/roadmap.component';
import { HackathonComponent } from './hackathon/hackathon.component';
import { SupportComponent } from './support/support.component';
import { CampaignsComponent } from './campaigns/campaigns.component';
import { OrgComponent } from './org/org.component';

const routes: Routes = [
  { path: 'leadership', component: LeadershipComponent },
  { path: 'roadmap', component: RoadmapComponent },
  { path: 'hackathon', component: HackathonComponent },
  { path: 'support', component: SupportComponent },
  { path: 'ads', component: CampaignsComponent },
  { path: 'organization-chart', component: OrgComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
