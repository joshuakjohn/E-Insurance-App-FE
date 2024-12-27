import { Component } from '@angular/core';
import { Location } from '@angular/common'; // Import Location service

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent {
  isBuyNowClicked = false; // Flag to track Buy Now button click state
  isConfirmVisible = false; // Flag to track Confirm/Cancel button visibility

  constructor(private location: Location) {}

  // Handle Buy Now button click
  onBuyNowClick() {
    this.isBuyNowClicked = true; // Mark Buy Now button as clicked
    this.isConfirmVisible = true; // Show Confirm/Cancel buttons
  }

  // Handle Confirm button click
  onConfirmClick() {
    alert('Purchase Confirmed!');
    // Implement further confirmation logic as needed
  }

  // Handle Cancel button click
  onCancelClick() {
    this.isBuyNowClicked = false; // Hide Confirm/Cancel buttons
    this.isConfirmVisible = false; // Hide Confirm/Cancel buttons
  }

  // Handle Go Back button click
  onGoBackClick() {
    this.location.back(); 
  }
}
