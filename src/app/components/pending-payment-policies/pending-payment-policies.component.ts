import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/services/http-services/http.service';
import { HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-pending-payment-policies',
  templateUrl: './pending-payment-policies.component.html',
  styleUrls: ['./pending-payment-policies.component.scss']
})
export class PendingPaymentPoliciesComponent implements OnInit {
  policyId!: string | null;
  policyDetails: any[] = []; 
  errorMessage: string = '';
  authToken: string | null = '';
  headers: HttpHeaders;
  isOverlayVisible: boolean = false;
  selectedPolicy: any = null;
  customerData: any;
  isLoading: boolean = true;


  constructor(
    private httpService: HttpService,
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
    this.fetchCustomerDetails()
  }

  fetchPolicyDetails(): void {
    if (!this.authToken) {
      this.errorMessage = 'Authorization token is missing.';
      return;
    }
    this.httpService.getApiCall('/api/v1/policy', this.headers).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.policyDetails = res.data;
          this.filterPolicies();
          this.isLoading = false
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

  filterPolicies() {
    this.policyDetails = this.policyDetails.filter(policy => {
      console.log(policy.premiumPaid);
      
      return policy.status === 'Active' && this.isPremiumDue(policy.createdAt, policy.premiumPaid) 
    });
  }

  isPremiumDue(createdAt: Date, premiumPaid: number): boolean {
    const startDate = new Date(createdAt)
    const currentDate = new Date()
    const diffTime = currentDate.getTime() - startDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24); // Total days
    const approxMonths = diffDays / 30.436875; // Average days in a month (365.25/12)   
     
    return approxMonths>premiumPaid;
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

    this.httpService.postApiCall('/api/v1/customer/paypremium/', data, this.headers).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.policyDetails.map(policy => {
            if(policy._id === data.policyId){
              policy.premiumPaid++;
              policy.pendingPremium--;
            }
            console.log(policy);
            
          })
          this.closeOverlay()
          this.filterPolicies()
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
