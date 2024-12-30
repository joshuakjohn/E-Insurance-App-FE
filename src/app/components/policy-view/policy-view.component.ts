import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
  policyDetails: any[] = []; // Initialize as an array
  errorMessage: string = '';
  authToken: string | null = '';
  headers: HttpHeaders;
  activeTab: string = 'active';
  isOverlayVisible: boolean = false; 
  selectedPolicy: any = null;

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private location: Location
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
  }

  fetchPolicyDetails(): void {
    if (!this.authToken) {
      this.errorMessage = 'Authorization token is missing.';
      return;
    }
    this.httpService.getPolicyCustomer('/api/v1/policy', { headers: this.headers }).subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.policyDetails = res.data; 
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
  
    // Check if the difference is exactly 25 days
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
   
    this.closeOverlay(); 
  }  
}
