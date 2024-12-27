import { Component } from '@angular/core';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.scss']
})
export class PolicyComponent {
  policy = {
    policyName: '',
    description: '',
    eligibilityCriteria: '',
    premium: 0,
    maturityPeriod: 0,
    coverage: 0,
  };

  createPolicy() {
    console.log('Policy Created:', this.policy);

    // Replace this with an API call to save the policy
    // Example:
    // this.policyService.createPolicy(this.policy).subscribe(response => {
    //   console.log('Policy saved:', response);
    // });

    alert('Policy Created Successfully!');
    this.policy = {
      policyName: '',
      description: '',
      eligibilityCriteria: '',
      premium: 0,
      maturityPeriod: 0,
      coverage: 0,
    }; // Reset the form after creation
  }

}
