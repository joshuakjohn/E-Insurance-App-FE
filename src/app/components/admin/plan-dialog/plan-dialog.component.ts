import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http-service/http.service';

@Component({
  selector: 'app-plan-dialog',
  templateUrl: './plan-dialog.component.html',
  styleUrls: ['./plan-dialog.component.scss']
})
export class PlanDialogComponent {
  planForm: FormGroup;
  isFormSubmitted = false;

  constructor(private formBuilder: FormBuilder, private httpService: HttpService, private dialogRef: MatDialogRef<PlanDialogComponent>
  ) {
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
        },
        error: (error) => {
          console.error('Error creating plan:', error);
        }
      });
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
