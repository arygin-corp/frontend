import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSecurityPostComponent } from './page-security-post.component';

describe('PageSecurityPostComponent', () => {
  let component: PageSecurityPostComponent;
  let fixture: ComponentFixture<PageSecurityPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageSecurityPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSecurityPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
