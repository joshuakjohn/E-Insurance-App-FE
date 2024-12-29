import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
  isEligible = false;
  isEligibilityOverlayVisible = false;
  eligibilityMessage: string = '';
  customerData: any = {};
  planId!: string | null;
  schemeId!: string | null;

  planDetails: any;
  schemeDetails: any;

  headers: HttpHeaders;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private httpService: HttpService
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
        }
      },
      error: (err: any) => {
        console.error('Error fetching customer details:', err);
      }
    });
  }

  openEligibilityOverlay() {
    this.isEligibilityOverlayVisible = true;
    this.eligibilityMessage = '';
    if (this.customerData) {
      this.customerData.age = '';
    }
  }

  closeEligibilityOverlay() {
    this.isEligibilityOverlayVisible = false;
  }

  validateAge() {
    const age = this.customerData.age;
    this.eligibilityMessage = age && isNaN(Number(age)) ? 'Please enter a valid number for age.' : '';
  }

  checkEligibility() {
    const criteria = this.schemeDetails?.eligibilityCriteria;

    if (!criteria) {
      this.eligibilityMessage = 'Eligibility criteria not provided.';
      this.isEligible = false;
      return;
    }

    const age = Number(this.customerData.age);

    if (isNaN(age)) {
      this.eligibilityMessage = 'Please enter a valid age.';
      this.isEligible = false;
      return;
    }

    const rangeMatch = /(\d+)\s*(to|[-–])\s*(\d+)\s*(age|years)?/i.exec(criteria);
    if (rangeMatch) {
      const [, minAge, , maxAge] = rangeMatch;
      this.isEligible = age >= +minAge && age <= +maxAge;
      this.eligibilityMessage = this.isEligible
        ? 'You are eligible!'
        : `Eligibility requires age between ${minAge} and ${maxAge}.`;
      if (this.isEligible) this.closeEligibilityOverlay();
      return;
    }

    const minAgeMatch = /min\s*(\d+)/i.exec(criteria);
    if (minAgeMatch) {
      const [, minAge] = minAgeMatch;
      this.isEligible = age >= +minAge;
      this.eligibilityMessage = this.isEligible
        ? 'You are eligible!'
        : `Eligibility requires a minimum age of ${minAge}.`;
      if (this.isEligible) this.closeEligibilityOverlay();
      return;
    }

    const maxAgeMatch = /max\s*(\d+)/i.exec(criteria);
    if (maxAgeMatch) {
      const [, maxAge] = maxAgeMatch;
      this.isEligible = age <= +maxAge;
      this.eligibilityMessage = this.isEligible
        ? 'You are eligible!'
        : `Eligibility requires a maximum age of ${maxAge}.`;
      if (this.isEligible) this.closeEligibilityOverlay();
      return;
    }

    this.eligibilityMessage = 'Unable to determine eligibility criteria.';
    this.isEligible = false;
  }

  onBuyNowClick() {
    if (this.isEligible) {
      this.isBuyNowClicked = true;
      this.isConfirmVisible = true;
    }
  }

  onConfirmClick() {
    console.log(this.schemeDetails)
    const data = {
      planId: this.planId,
      schemeId: this.schemeId,
      customerId: this.customerData._id,
      agentId: this.customerData.agentId,
      policyName: this.schemeDetails.schemeName,
      description: this.schemeDetails.description,
      premiumAmount: this.schemeDetails.premium,
      duration: this.schemeDetails.maturityPeriod,
      coverage: this.schemeDetails.coverage
    };

    this.httpService.createPolicy('/api/v1/policy', data, { headers: this.headers }).subscribe({
      next: (res) => {
        console.log('Policy created successfully', res);
      },
      error: (err) => {
        console.error('Error creating policy', err);
        console.error('Response body:', err.error);
      }
    });
  }

  onCancelClick() {
    this.isBuyNowClicked = false;
    this.isConfirmVisible = false;
  }

  onGoBackClick() {
    this.location.back();
  }
}
