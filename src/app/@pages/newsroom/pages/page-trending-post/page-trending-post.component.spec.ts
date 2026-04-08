import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTrendingPostComponent } from './page-trending-post.component';

describe('PageTrendingPostComponent', () => {
  let component: PageTrendingPostComponent;
  let fixture: ComponentFixture<PageTrendingPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageTrendingPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageTrendingPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
