import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTrendingPostDetailsComponent } from './page-trending-post-details.component';

describe('PageTrendingPostDetailsComponent', () => {
  let component: PageTrendingPostDetailsComponent;
  let fixture: ComponentFixture<PageTrendingPostDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageTrendingPostDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageTrendingPostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
