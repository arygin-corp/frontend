import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NewsroomService } from '../../../../@shared/services/newsroom.service';
import { Newsroom } from '../../../../@shared/interfaces/newsroom';

@Component({
  selector: 'app-page-security-post',
  templateUrl: './page-security-post.component.html',
  styleUrls: ['./page-security-post.component.scss']
})
export class PageSecurityPostComponent implements OnInit {
  posts: Newsroom[] = [];

  constructor(
    private newsroomService: NewsroomService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.posts = this.newsroomService.getNewsroom().filter(p => p.category === 'security');
  }

  openDetails(post: Newsroom) {
    this.router.navigate(['feature', 'details', post.id], { relativeTo: this.route });
  }
}