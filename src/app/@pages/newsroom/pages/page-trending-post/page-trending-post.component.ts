import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NewsroomService } from '../../../../@shared/services/newsroom.service';
import { Newsroom } from '../../../../@shared/interfaces/newsroom';

@Component({
  selector: 'app-page-trending-post',
  templateUrl: './page-trending-post.component.html',
  styleUrls: ['./page-trending-post.component.scss']
})

export class PageTrendingPostComponent implements OnInit {
  posts: Newsroom[] = [];

  constructor(
    private newsroomService: NewsroomService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.posts = this.newsroomService.getNewsroom().filter(p => p.category === 'trending');
  }

  openDetails(post: Newsroom) {
    this.router.navigate(['feature', 'details', post.id], { relativeTo: this.route });
  }
}
