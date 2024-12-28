import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from 'src/app/service/http-service/http.service';

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
  customerData = {
    age: '',
    income: 50000
  };

  planId!: string | null;
  schemeId!: string | null;

  planDetails: any;
  schemeDetails: any;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    public httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('planId');
    this.schemeId = this.route.snapshot.paramMap.get('schemeId');
    this.fetchPlanDetails();
    this.fetchSchemeDetails();
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
        },
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
        },
      });
    }
  }

  openEligibilityOverlay() {
    this.isEligibilityOverlayVisible = true;
    this.eligibilityMessage = '';
    this.customerData.age = '';
  }

  closeEligibilityOverlay() {
    this.isEligibilityOverlayVisible = false;
  }

  validateAge() {
    const age = this.customerData.age;
    if (age && isNaN(Number(age))) {
      this.eligibilityMessage = 'Please enter a valid number for age.';
    } else {
      this.eligibilityMessage = '';
    }
  }
  checkEligibility() {
    const criteria = this.schemeDetails?.eligibilityCriteria;
  
    if (!criteria) {
      this.eligibilityMessage = 'Eligibility criteria not provided.';
      return;
    }
  
    const age = +this.customerData.age;
  
    if (isNaN(age)) {
      this.eligibilityMessage = 'Please enter a valid age.';
      return;
    }
  
    const rangeMatch = /(\d+)\s*(to|[-–])\s*(\d+)\s*(age|years)?\s*(people|pepole)?/i.exec(criteria);
    if (rangeMatch) {
      const [_, minAge, word, maxAge] = rangeMatch;
      if (age >= +minAge && age <= +maxAge) {
        this.eligibilityMessage = 'You are eligible!';
        this.isEligible = true;
        this.closeEligibilityOverlay();
      } else {
        this.eligibilityMessage = `Eligibility requires age between ${minAge} and ${maxAge}.`;
        this.isEligible = false;
      }
      return;
    }
  
    const minAgeMatch = /min\s*(\d+)/i.exec(criteria);
    if (minAgeMatch) {
      const [, minAge] = minAgeMatch;
      if (age >= +minAge) {
        this.eligibilityMessage = 'You are eligible!';
        this.isEligible = true;
        this.closeEligibilityOverlay();
      } else {
        this.eligibilityMessage = `Eligibility requires a minimum age of ${minAge}.`;
        this.isEligible = false;
      }
      return;
    }
  
    const maxAgeMatch = /max\s*(\d+)/i.exec(criteria);
    if (maxAgeMatch) {
      const [, maxAge] = maxAgeMatch;
      if (age <= +maxAge) {
        this.eligibilityMessage = 'You are eligible!';
        this.isEligible = true;
        this.closeEligibilityOverlay();
      } else {
        this.eligibilityMessage = `Eligibility requires a maximum age of ${maxAge}.`;
        this.isEligible = false;
      }
      return;
    }
  
    const generalEligibility = /age\s*([^\d]+)/i.exec(criteria);
    if (generalEligibility) {
      const message = generalEligibility[1].trim();
      this.eligibilityMessage = `Eligibility criteria: ${message}`;
      this.isEligible = false;
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
    alert('Purchase Confirmed!');
  }

  onCancelClick() {
    this.isBuyNowClicked = false;
    this.isConfirmVisible = false;
  }

  onGoBackClick() {
    this.location.back();
  }
}
