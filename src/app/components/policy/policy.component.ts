import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/service/http-service/http.service';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent implements OnInit {
  isBuyNowClicked = false;
  isConfirmVisible = false;
  eligibilityMessage: string = 'Checking eligibility...';
  isEligible = false; 
  planId!: string | null;
  schemeId!: string | null;
  planDetails: any;
  schemeDetails: any;
  customerData: any;
  headers: HttpHeaders;
  files: { [key: string]: File[] } = { profilePhoto: [], uploadedDocuments: [] }; // Track uploaded files

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private httpService: HttpService,
    private router: Router
  ) {
    const authToken = localStorage.getItem('authToken');
    this.headers = authToken
      ? new HttpHeaders().set('Authorization', `Bearer ${authToken}`)
      : new HttpHeaders();
    if (!authToken) {
      console.error('Authorization token is missing');
    }
  }

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('planId');
    this.schemeId = this.route.snapshot.paramMap.get('schemeId');
    this.fetchPlanDetails();
    this.fetchSchemeDetails();
    this.fetchCustomerDetails();
  }

  fetchPlanDetails(): void {
    if (this.planId) {
      this.httpService.getPlanById(`/api/v1/plan/${this.planId}`).subscribe({
        next: (res: any) => {
          if (res.code === 200) {
            this.planDetails = res.plan;
          }
        },
        error: (err: any) => {
          console.error('Error fetching plan details:', err);
        }
      });
    }
  }

  fetchSchemeDetails(): void {
    if (this.schemeId) {
      this.httpService.getSchemeById(`/api/v1/scheme/${this.schemeId}`).subscribe({
        next: (res: any) => {
          if (res.code === 200) {
            this.schemeDetails = res.scheme;
          }
        },
        error: (err: any) => {
          console.error('Error fetching scheme details:', err);
        }
      });
    }
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
          this.displayEligibilityMessage();
        }
      },
      error: (err: any) => {
        console.error('Error fetching customer details:', err);
      }
    });
  }

  displayEligibilityMessage(): void {
    if (!this.customerData || !this.schemeDetails?.eligibilityCriteria) {
      this.eligibilityMessage = 'Eligibility criteria or customer data is missing.';
      this.isEligible = false;
      return;
    }
  
    const eligibilityCriteria = this.schemeDetails.eligibilityCriteria.trim();  
    let ageMatch: RegExpExecArray | null;
    let minAge: number, maxAge: number;
  
    // Check for "btw <minAge>-<maxAge> years of age" format
    ageMatch = eligibilityCriteria.match(/btw (\d+)-(\d+) years of age/);
    if (ageMatch) {
      minAge = parseInt(ageMatch[1], 10);
      maxAge = parseInt(ageMatch[2], 10);
    } else {
      // Check for "<minAge> to <maxAge> age people" format
      ageMatch = eligibilityCriteria.match(/(\d+)\s*to\s*(\d+)\s*age\s*(people|pepole)?/); // Fix typo 'pepole'
      if (ageMatch) {
        minAge = parseInt(ageMatch[1], 10);
        maxAge = parseInt(ageMatch[2], 10);
      } else {
        // Check for "ages between <minAge> and <maxAge>" format
        ageMatch = eligibilityCriteria.match(/ages?\s*between\s*(\d+)\s*and\s*(\d+)/);
        if (ageMatch) {
          minAge = parseInt(ageMatch[1], 10);
          maxAge = parseInt(ageMatch[2], 10);
        } else {
          // If no valid format is found
          this.eligibilityMessage = 'Eligibility criteria format is incorrect.';
          this.isEligible = false;
          return;
        }
      }
    }
    const age = this.customerData.age; // Assuming 'age' is provided in customer details
    // Check if the customer is eligible based on the age range
    if (age >= minAge && age <= maxAge) {
      this.isEligible = true;
      this.eligibilityMessage = 'You are eligible!';
    } else {
      this.isEligible = false;
      this.eligibilityMessage = `You are not eligible. Age must be between ${minAge} and ${maxAge}.`;
    }
  }
  onBuyNowClick(): void {
    this.isBuyNowClicked = true;
    this.isConfirmVisible = true;
  }

  onConfirmClick(): void {
    const formData = new FormData();
    formData.append('policyName', this.schemeDetails.schemeName);
    formData.append('description', this.schemeDetails.description);
    formData.append('premiumAmount', this.schemeDetails.premium.toString());
    formData.append('coverage', this.schemeDetails.coverage.toString());
    formData.append('duration', this.schemeDetails.maturityPeriod.toString());
    formData.append('planId', this.planId!);
    formData.append('schemeId', this.schemeId!);
    formData.append('customerId', this.customerData._id);
    formData.append('agentId', this.customerData.agentId);

    // Append files to FormData
    this.files['profilePhoto'].forEach(file => formData.append('profilePhoto', file, file.name));
    this.files['uploadedDocuments'].forEach(file => formData.append('uploadedDocuments', file, file.name));

    this.httpService.createPolicy('/api/v1/policy', formData, { headers: this.headers }).subscribe({
      next: (res) => {
        alert('Your policy has been approved successfully!');
        this.location.back();
      },
      error: (err) => {
        console.error('Error creating policy', err);
      }
    });
  }

  onCancelClick(): void {
    this.isBuyNowClicked = false;
    this.isConfirmVisible = false;
  }

  onGoBackClick(): void {
    this.location.back();
  }

  onFileSelect(event: any, field: string): void {
    this.files[field] = Array.from(event.target.files);
  }
}
