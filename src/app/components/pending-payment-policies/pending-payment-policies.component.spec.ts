import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingPaymentPoliciesComponent } from './pending-payment-policies.component';

describe('PendingPaymentPoliciesComponent', () => {
  let component: PendingPaymentPoliciesComponent;
  let fixture: ComponentFixture<PendingPaymentPoliciesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PendingPaymentPoliciesComponent]
    });
    fixture = TestBed.createComponent(PendingPaymentPoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
