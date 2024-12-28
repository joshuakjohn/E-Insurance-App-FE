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
    // Get planId and schemeId from route parameters
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
    console.log(this.schemeId)
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
    const age = parseInt(this.customerData.age, 10);
  
    if (isNaN(age)) {
      this.eligibilityMessage = 'Please enter a valid age.';
      return;
    }
  
    if (this.schemeDetails?.eligibilityCriteria) {
      // Parse eligibility criteria (e.g., "btw 40-60 years of age")
      const regex = /btw\s(\d+)-(\d+)/i;
      const match = regex.exec(this.schemeDetails.eligibilityCriteria);
  
      if (match) {
        const minAge = parseInt(match[1], 10);
        const maxAge = parseInt(match[2], 10);
  
        if (age >= minAge && age <= maxAge) {
          this.isEligible = true;
          this.eligibilityMessage = 'You are eligible for the plan!';
          this.closeEligibilityOverlay();
          return;
        }
      }
    }
  
    this.isEligible = false;
    this.eligibilityMessage = "You're not eligible for the policy.";
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
