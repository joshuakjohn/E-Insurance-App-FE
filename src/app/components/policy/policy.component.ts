import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent {
  isBuyNowClicked = false;
  isConfirmVisible = false;
  isEligible = false;
  isEligibilityOverlayVisible = false;
  eligibilityMessage: string = '';
  customerData = {
    age: '',
    income: 50000
  };

  constructor(private location: Location) {}

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
    
    if (age >= 18 && age <= 60) {
      this.isEligible = true;
      this.eligibilityMessage = 'You are eligible for the plan!';
      this.closeEligibilityOverlay();  // Close overlay if eligible
    } else {
      this.isEligible = false;
      this.eligibilityMessage = "You're not eligible for the policy."; // Show message inside overlay
    }
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
