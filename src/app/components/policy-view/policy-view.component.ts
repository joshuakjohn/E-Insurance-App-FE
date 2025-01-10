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
  policyDetails: any[] = []; 
  errorMessage: string = '';
  authToken: string | null = '';
  headers: HttpHeaders;
  activeTab: string = 'active';
  isOverlayVisible: boolean = false;
  selectedPolicy: any = null;
  customerData: any;
  isLoading: boolean = false;
  tabs = [
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' }
  ];

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private location: Location, 
    private cdr: ChangeDetectorRef
  ) {
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
    this.isLoading = true;
    if (!this.authToken) {
      this.errorMessage = 'Authorization token is missing.';
      return;
    }
    this.httpService.getPolicyCustomer('/api/v1/policy', { headers: this.headers }).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.policyDetails = res.data;
          this.isLoading = false;
         
        } else {
          this.errorMessage = 'Unable to fetch policy details.';
        }
      },
      error: (err: any) => {
        this.errorMessage = 'An error occurred while fetching policy details.';
        console.error('Error fetching policy:', err);
        this.isLoading = false;
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
    const policy = this.policyDetails.filter(policy => {
      return this.activeTab === 'active'
        ? policy.status === 'Active'
        : policy.status === 'submitted' || policy.status === 'Waiting for approval';
    });   
    return policy
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }

  isPremiumDue(createdAt: Date, lastPaymentDate: Date): boolean {
    const currentDate = new Date();
    const createdDate = new Date(createdAt);
    const lastPayment = lastPaymentDate ? new Date(lastPaymentDate) : createdDate;

    // Calculate the difference in time since the last payment or policy creation
    const timeDifference = currentDate.getTime() - lastPayment.getTime();
    const dayDifference = timeDifference / (1000 * 3600 * 24);
    return dayDifference >= 25;
  }

  showOverlay(policy: any): void {
    this.selectedPolicy = policy;
    this.isOverlayVisible = true;
  }

  closeOverlay(): void {
    this.isOverlayVisible = false;
  }

  payPremium(policy: any): void {
    const data = {
      policyId: policy._id,
      agentId: this.customerData.agentId,
      paymentAmount: policy.premiumAmount
    };

    this.httpService.payPremium('/api/v1/customer/paypremium/', data, { headers: this.headers }).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          console.log('Payment successful:', res.message);
          this.fetchPolicyDetails();
  
          setTimeout(() => this.cdr.detectChanges(), 0);
          this.closeOverlay();
          policy.lastPaymentDate = new Date().toISOString();
        } else {
          console.error('Payment failed:', res.message);
        }
      },
      error: (err: any) => {
        console.error('Error making payment:', err);
      }
    });
  }

  setActiveTab(tabKey: string): void {
    this.activeTab = tabKey;
  }
}
