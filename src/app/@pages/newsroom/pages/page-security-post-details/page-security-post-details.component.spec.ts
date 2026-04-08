import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageSecurityPostDetailsComponent } from './page-security-post-details.component';

describe('PageSecurityPostDetailsComponent', () => {
  let component: PageSecurityPostDetailsComponent;
  let fixture: ComponentFixture<PageSecurityPostDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageSecurityPostDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSecurityPostDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
