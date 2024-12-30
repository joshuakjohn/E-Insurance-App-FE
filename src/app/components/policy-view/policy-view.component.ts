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
        console.log('API Response:', res); // Debugging: Log the API response
        if (res.code === 200) {
          this.policyDetails = res.data; // Ensure the structure matches
          console.log('Policy Details:', this.policyDetails); // Debugging: Log the parsed data
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
}
