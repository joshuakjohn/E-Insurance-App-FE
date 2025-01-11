import { HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from 'src/app/services/http-services/http.service';
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
  selectedPolicy: any = null;
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
  }

  fetchPolicyDetails(): void {
    this.isLoading = true;
    if (!this.authToken) {
      this.errorMessage = 'Authorization token is missing.';
      return;
    }
    this.httpService.getApiCall('/api/v1/policy', this.headers).subscribe({
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

  setActiveTab(tabKey: string): void {
    this.activeTab = tabKey;
  }
}
