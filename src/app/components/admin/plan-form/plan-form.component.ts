import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http-service/http.service';

@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.component.html',
  styleUrls: ['./plan-form.component.scss']
})
export class PlanFormComponent {
  planForm!: FormGroup;
  isFormSubmitted = false;
  
  constructor(private formBuilder: FormBuilder, private httpService: HttpService, private router: Router) { }

  ngOnInit(): void {
    this.planForm = this.formBuilder.group({
      planName: ['', Validators.required],
      description: [''],
      category: ['', Validators.required]
    });
  }

  get planFormControls() {
    return this.planForm.controls;
  }

  handleSubmit() {
    this.isFormSubmitted = true;
    if (this.planForm.valid) {
      const { planName, description, category } = this.planForm.value;
    
      const payload: { planName: string; category: string; description?: string } = {planName, category};
    
      // Add description if it's not empty
      if (description) {
        payload.description = description;
      }
      this.httpService.postApiCall('/api/v1/plan', payload).subscribe({
        next: (res) => {
          console.log('Plan created successfully:', res);
          this.router.navigate(['/dashboard/plans']); 
        },
        error: (error) => {
          console.error('Error creating plan:', error);
        },
      });
    }
  }

  onClose(): void {
    this.router.navigate(['/dashboard/plans']); 
  }
}
