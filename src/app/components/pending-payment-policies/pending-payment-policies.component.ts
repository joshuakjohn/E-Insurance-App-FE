import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http-services/http.service';
import { HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-pending-payment-policies',
  templateUrl: './pending-payment-policies.component.html',
  styleUrls: ['./pending-payment-policies.component.scss']
})
export class PendingPaymentPoliciesComponent implements OnInit {
  authToken: string | null = '';
  headers: HttpHeaders;
  allPolicies: any[] = [];
  pendingPolicies: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  isPaymentDisabled: boolean = false;
  isOverlayVisible: boolean = false;
  selectedPolicy: any;
  customerData: any;

  constructor(private httpService: HttpService, private cdr: ChangeDetectorRef, private location: Location) {
    this.authToken = localStorage.getItem('authToken');
    this.headers = this.authToken
      ? new HttpHeaders().set('Authorization', `Bearer ${this.authToken}`)
      : new HttpHeaders();
  }

  ngOnInit(): void {
    if (this.authToken) {
      this.fetchAllPolicies();
      this.fetchCustomerDetails();
    } else {
      this.errorMessage = 'Authorization token is missing.';
    }
  }

  fetchAllPolicies(): void {
    this.isLoading = true;
    if (!this.authToken) {
      this.errorMessage = 'Authorization token is missing.';
      this.isLoading = false;
      return;
    }

    this.httpService.getApiCall('/api/v1/policy', this.headers).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.allPolicies = res.data;
          this.filterPendingPolicies();
        } else {
          this.errorMessage = 'Unable to fetch policy details.';
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'An error occurred while fetching policy details.';
        console.error('Error fetching policies:', err);
        this.isLoading = false;
      }
    });
  }

  filterPendingPolicies(): void {
    this.pendingPolicies = this.allPolicies.filter(policy => {
      return policy.status === 'Active' && this.isPremiumDue(policy.updatedAt, policy.premiumPaid, policy.duration);
    });
  }

  fetchCustomerDetails(): void {
    if (!this.headers.has('Authorization')) {
      console.error('Authorization token is missing');
      return;
    }

    this.httpService.getApiCall('/api/v1/customer/getcustomer', this.headers).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.customerData = res.data;
        }
      },
      error: (err: any) => {
        console.error('Error fetching customer details:', err);
      }
    });
  }

  onGoBack(): void {
    this.location.back();
  }

  isPremiumDue(nextPremiumDue: Date, premiumPaid: number, duration: number): boolean {
    if (premiumPaid <= 0 || duration <= 0) {
      console.error('Invalid premiumPaid or duration value');
      return false;
    }
  
    const nextDueDate = new Date(nextPremiumDue);
    nextDueDate.setDate(nextDueDate.getDate() + 30); 
    if (isNaN(nextDueDate.getTime())) {
      console.error('Invalid nextPremiumDue date');
      return false;
    }
  
    const currentDate = new Date(); // Corrected here
    const diffTime = currentDate.getTime() - nextDueDate.getTime();
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30); // Convert milliseconds to months
  
    const expectedPremiumPerMonth = premiumPaid * 1;
    const expectedPremium = diffMonths * expectedPremiumPerMonth;
  
    return premiumPaid < expectedPremium && diffMonths > 0;
  }
  

  closeOverlay(): void {
    this.isOverlayVisible = false;
  }

  proceedWithPayment(): void {
    console.log('Payment proceeding...');
  }

  payPremium(policy: any, monthsToPay: number): void {
    const paymentData = {
      policyId: policy._id,
      agentId: this.customerData?.agentId,
      paymentAmount: policy.premiumAmount * monthsToPay,
    };
  
    this.httpService.postApiCall('/api/v1/customer/paypremium/', paymentData, this.headers).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          // Step 1: Take the updatedAt from the response
          const nextPayment = new Date(res.data.paymentDate);
          this.updateNextDueDate(policy, nextPayment);
  
          // Step 2: Remove the paid policy from pendingPolicies
          this.pendingPolicies = this.pendingPolicies.filter(p => p._id !== policy._id);
  
          // Step 3: Manually trigger change detection
          this.cdr.detectChanges();
  
          // Step 4: Optionally, re-filter pending policies in case any changes were missed
          this.filterPendingPolicies();
  
          // Step 5: Close the overlay
          this.closeOverlay();
        }
      },
      error: (err) => {
        console.error('Error during payment:', err);
      },
    });
  }
  

  updateNextDueDate(policy: any, updatedAt: Date): void {
    const currentDate = new Date();

    let updatedDueDate = new Date(updatedAt);

    // Add the policy duration (in months) to the updated date
    updatedDueDate.setMonth(updatedDueDate.getMonth() + policy.duration);

    // Now update the policy with the new nextDueDate and updatedAt
    const updateData = {
      nextPremiumDue: updatedDueDate,
      updatedAt: currentDate, 
    };
    }

  showOverlay(policy: any): void {
    this.selectedPolicy = policy;
    this.isOverlayVisible = true;
  }
}
