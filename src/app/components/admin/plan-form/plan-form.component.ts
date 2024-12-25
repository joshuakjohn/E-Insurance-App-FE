import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from 'src/app/services/http-service/http.service';

@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.component.html',
  styleUrls: ['./plan-form.component.scss']
})
export class PlanFormComponent {
  planForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private httpService: HttpService){}

  ngOnInit(): void {
    this.planForm = this.formBuilder.group({
      planName: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  get planFormControls() {
    return this.planForm.controls;
  }

  handleSubmit() {
    if (this.planForm.valid) {
      const { planName, description, category } = this.planForm.value;

      this.httpService.postApiCall('/api/v1/plan', { planName, description, category }).subscribe({
        next: (response) => {
          console.log('Plan created successfully:', response);
        },
        error: (error) => {
          console.error('Error creating plan:', error);
        }
      });
    }
  }
}
