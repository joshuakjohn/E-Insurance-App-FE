import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http-services/http.service';
import { HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';  // Added for cdr.detectChanges()
import { Location } from '@angular/common';  // Import Location for navigation

@Component({
  selector: 'app-pending-payment-policies',
  templateUrl: './pending-payment-policies.component.html',
  styleUrls: ['./pending-payment-policies.component.scss']
})
export class PendingPaymentPoliciesComponent implements OnInit {
  authToken: string | null = '';
  headers: HttpHeaders;
  allPolicies: any[] = [];  // Store all policies
  pendingPolicies: any[] = [];  // Store pending policies after filtering
  errorMessage: string = '';
  isLoading: boolean = false;

  // New properties for overlay and button states
  isPaymentDisabled: boolean = false;
  isOverlayVisible: boolean = false; // Fix: define isOverlayVisible
  selectedPolicy: any;  // Fix: initialize selectedPolicy
  customerData: any;  // Fix: initialize customerData

  constructor(private httpService: HttpService, private cdr: ChangeDetectorRef, private location: Location) {
    this.authToken = localStorage.getItem('authToken');
    this.headers = this.authToken
      ? new HttpHeaders().set('Authorization', `Bearer ${this.authToken}`)
      : new HttpHeaders();
  }

  ngOnInit(): void {
    if (this.authToken) {
      this.fetchAllPolicies();
      this.fetchCustomerDetails();  // Fetch customer details when component initializes
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

    // Fetch all policies from the existing endpoint
    this.httpService.getApiCall('/api/v1/policy', this.headers).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.allPolicies = res.data;  // Store all policies
          this.filterPendingPolicies();  // Filter pending policies
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
    // Filter policies based on premium due date and premium paid less than the duration
    this.pendingPolicies = this.allPolicies.filter(policy => {
      return this.isPremiumDue(policy.createdAt, policy.premiumPaid, policy.duration);
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
    this.location.back();  // Use the Location service to navigate back
  }

  getOtherPolicies(): any[] {
    // Return policies that are NOT 'Pending'
    return this.allPolicies.filter(policy => policy.status !== 'Pending');
  }

 isPremiumDue(createdAt: Date, premiumPaid: number, duration: number): boolean {
    // Step 1: Validate premiumPaid and duration
    if (premiumPaid <= 0 || duration <= 0) {
      console.error('Invalid premiumPaid or duration value');
      return false;
    }
  
    // Step 2: Validate the createdAt date
    const startDate = new Date(createdAt);
    if (isNaN(startDate.getTime())) {
      console.error('Invalid createdAt date');
      return false;
    }
  
    // Step 3: Calculate the difference in months from the createdAt date to the current date
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - startDate.getTime(); // Time difference in milliseconds
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30); // Convert milliseconds to months (approx. 30 days per month)
  
    // Step 4: Calculate the expected premium for the elapsed months
    const expectedPremiumPerMonth = 100;  // Example premium per month, adjust as needed
    const expectedPremium = diffMonths * expectedPremiumPerMonth;
  
    // Step 5: Check if the premium is due (paid less than expected)
    const premiumDue = premiumPaid < expectedPremium;
  
    // Step 6: Check if the policy duration has been exceeded
    const durationExceeded = diffMonths >= duration;
  
    // Step 7: Return true if both conditions are met
    return premiumDue && !durationExceeded;
  }
  
  // Method to close overlay
  closeOverlay(): void {
    this.isOverlayVisible = false;
  }

  // Method to proceed with payment
  proceedWithPayment(): void {
    // Implement payment logic here
    console.log('Payment proceeding...');
  }

  payPremium(policy: any): void {
    const paymentData = {
      policyId: policy._id,
      agentId: this.customerData?.agentId,
      paymentAmount: policy.premiumAmount,
    };
  
    this.httpService.postApiCall('/api/v1/customer/paypremium/', paymentData, this.headers).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          // Remove the paid policy from the pending list
          this.pendingPolicies = this.pendingPolicies.filter(p => p._id !== policy._id);
  
          // Refresh the policies if needed
          this.fetchAllPolicies();
  
          // Close the overlay and update the UI
          this.closeOverlay();
          this.cdr.detectChanges();
        }
      },
      error: () => {
       
      },
    });
  }
  

  showOverlay(policy: any): void {
    this.selectedPolicy = policy; 
    this.isOverlayVisible = true;
  }
}
