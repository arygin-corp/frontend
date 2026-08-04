import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NewsroomService } from '../../../../@shared/services/newsroom.service';
import { Newsroom } from '../../../../@shared/interfaces/newsroom';

@Component({
  selector: 'app-page-feature-post-details',
  templateUrl: './page-feature-post-details.component.html',
  styleUrls: ['./page-feature-post-details.component.scss']
})
export class PageFeaturePostDetailsComponent implements OnInit {
  post?: Newsroom;
  safeContent?: SafeHtml;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsroomService: NewsroomService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['../'], { relativeTo: this.route });
      return;
    }

    const found = this.newsroomService.getNewsroomById(id);
    if (!found) {
      this.router.navigate(['../'], { relativeTo: this.route });
      return;
    }

    this.post = found;
    this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.post.content);
  }

  back() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}