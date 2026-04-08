import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageFeaturePostComponent } from './page-feature-post.component';

describe('PageFeaturePostComponent', () => {
  let component: PageFeaturePostComponent;
  let fixture: ComponentFixture<PageFeaturePostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageFeaturePostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageFeaturePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
