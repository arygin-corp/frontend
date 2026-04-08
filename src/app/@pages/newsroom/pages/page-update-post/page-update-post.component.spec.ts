import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageUpdatePostComponent } from './page-update-post.component';

describe('PageUpdatePostComponent', () => {
  let component: PageUpdatePostComponent;
  let fixture: ComponentFixture<PageUpdatePostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageUpdatePostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageUpdatePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
