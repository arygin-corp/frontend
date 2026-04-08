import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageUpdatePostDetailsComponent } from './page-update-post-details.component';

describe('PageUpdatePostDetailsComponent', () => {
  let component: PageUpdatePostDetailsComponent;
  let fixture: ComponentFixture<PageUpdatePostDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageUpdatePostDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageUpdatePostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
