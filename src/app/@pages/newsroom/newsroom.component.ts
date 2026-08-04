import { Component, OnInit } from '@angular/core';
import { NewsroomService } from '../../@shared/services/newsroom.service';
import { Newsroom } from '../../@shared/interfaces/newsroom';

@Component({
  selector: 'app-newsroom',
  templateUrl: './newsroom.component.html',
  styleUrls: ['./newsroom.component.scss']
})
export class NewsroomComponent implements OnInit {
  allPosts: Newsroom[] = [];
  posts: Newsroom[] = [];
  query = '';
  selectedCategory: string | null = null;
  categories: string[] = [];

  constructor(private newsroomService: NewsroomService) {}

  ngOnInit(): void {
    this.allPosts = this.newsroomService.getNewsroom();
    this.posts = [...this.allPosts];
    this.categories = Array.from(new Set(this.allPosts.map(p => p.category || 'other')));
  }

  onSearch(q: string) {
    this.query = q || '';
    this.applyFilters();
  }

  selectCategory(cat: string | null) {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  private applyFilters() {
    const q = this.query.trim().toLowerCase();
    this.posts = this.allPosts.filter(p => {
      const matchesCategory = !this.selectedCategory || p.category === this.selectedCategory;
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.summary && p.summary.toLowerCase().includes(q)) ||
        (p.content && p.content.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }

  getDetailsRoute(post: Newsroom): any[] {
    const map: { [k: string]: string } = {
      features: 'feature',
      updates: 'update',
      trending: 'trending',
      security: 'security'
    };
    const routeKey = map[post.category || ''] || 'feature';
    return ['/newsroom', routeKey, 'details', post.id];
  }
}