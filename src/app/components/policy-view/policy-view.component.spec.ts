import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyViewComponent } from './policy-view.component';

describe('PolicyViewComponent', () => {
  let component: PolicyViewComponent;
  let fixture: ComponentFixture<PolicyViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyViewComponent]
    });
    fixture = TestBed.createComponent(PolicyViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
