import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskAIComponent } from './ask-a-i.component';

describe('AskAIComponent', () => {
  let component: AskAIComponent;
  let fixture: ComponentFixture<AskAIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskAIComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AskAIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
