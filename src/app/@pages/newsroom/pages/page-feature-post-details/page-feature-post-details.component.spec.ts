import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageFeaturePostDetailsComponent } from './page-feature-post-details.component';

describe('PageFeaturePostDetailsComponent', () => {
  let component: PageFeaturePostDetailsComponent;
  let fixture: ComponentFixture<PageFeaturePostDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageFeaturePostDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageFeaturePostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
