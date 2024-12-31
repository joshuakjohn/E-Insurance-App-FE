import { HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from 'src/app/service/http-service/http.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-policy-view',
  templateUrl: './policy-view.component.html',
  styleUrls: ['./policy-view.component.scss']
})
export class PolicyViewComponent implements OnInit {
  policyId!: string | null;
  policyDetails: any[] = []; // Consider typing this more specifically, e.g., Policy[]
  errorMessage: string = '';
  authToken: string | null = '';
  headers: HttpHeaders;
  activeTab: string = 'active';
  isOverlayVisible: boolean = false;
  selectedPolicy: any = null;
  customerData: any;

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private location: Location, private cdr: ChangeDetectorRef
  ) {
    // Retrieve token from localStorage and set it in the headers
    this.authToken = localStorage.getItem('authToken');
    this.headers = this.authToken
      ? new HttpHeaders().set('Authorization', `Bearer ${this.authToken}`)
      : new HttpHeaders();
  }

  ngOnInit(): void {
    if (this.authToken) {
      this.fetchPolicyDetails();
    } else {
      this.errorMessage = 'Authorization token is missing.';
    }
    this.fetchCustomerDetails();
  }

  fetchPolicyDetails(): void {
    if (!this.authToken) {
      this.errorMessage = 'Authorization token is missing.';
      return;
    }
    this.httpService.getPolicyCustomer('/api/v1/policy', { headers: this.headers }).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.policyDetails = res.data; // Assuming 'data' is the array of policies
        } else {
          this.errorMessage = 'Unable to fetch policy details.';
        }
      },
      error: (err: any) => {
        this.errorMessage = 'An error occurred while fetching policy details.';
        console.error('Error fetching policy:', err);
      }
    });
  }

  fetchCustomerDetails(): void {
    if (!this.headers.has('Authorization')) {
      console.error('Authorization token is missing');
      return;
    }

    this.httpService.getCustomerById('/api/v1/customer/getcustomer', { headers: this.headers }).subscribe({
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

  get filteredPolicies() {
    return this.policyDetails.filter(policy => {
      return this.activeTab === 'active'
        ? policy.status === 'Active'
        : policy.status === 'submitted';
    });
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  isPremiumDue(createdAt: Date): boolean {
    const currentDate = new Date();
    const createdDate = new Date(createdAt);

    // Calculate the difference in time
    const timeDifference = currentDate.getTime() - createdDate.getTime();

    // Convert the time difference to days
    const dayDifference = timeDifference / (1000 * 3600 * 24);

    // Check if the difference is greater than or equal to 25 days
    return dayDifference >= 0;
  }

  showOverlay(policy: any): void {
    this.selectedPolicy = policy;
    this.isOverlayVisible = true;
  }

  closeOverlay(): void {
    this.isOverlayVisible = false;
  }

  payPremium(policy: any): void {
    console.log(`Paying premium for policy: ${policy.policyName}`);
  
    const data = {
      policyId: policy._id,
      agentId: this.customerData.agentId,
      paymentAmount: policy.premiumAmount
    };
  
    this.httpService.payPremium('/api/v1/customer/paypremium/', data, { headers: this.headers }).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          console.log('Payment successful:', res.message);
  
          // Refresh policies to get the latest state from the database
          this.fetchPolicyDetails();
  
          // Trigger change detection if necessary
          setTimeout(() => this.cdr.detectChanges(), 0);
  
          // Close the overlay after refreshing
          this.closeOverlay();
        } else {
          console.error('Payment failed:', res.message);
        }
      },
      error: (err: any) => {
        console.error('Error making payment:', err);
      }
    });
  }
  
  
}
