import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http-service/http.service';

@Component({
  selector: 'app-scheme-form',
  templateUrl: './scheme-form.component.html',
  styleUrls: ['./scheme-form.component.scss']
})
export class SchemeFormComponent {
  schemeForm!: FormGroup;
  isFormSubmitted = false;

  constructor(private formBuilder: FormBuilder, private httpService: HttpService, private router: Router) {}

  ngOnInit(): void {
    this.schemeForm = this.formBuilder.group({
      schemeName: ['', Validators.required],
      planId : ['', Validators.required],
      description: ['', Validators.required],
      eligibilityCriteria: ['', Validators.required],
      premium: ['', Validators.required],
      maturityPeriod: ['', Validators.required],
      coverage: ['', Validators.required]
    });
  }

  get SchemeFormControls() {
    return this.schemeForm.controls;
  }

  handleSubmit() {
    this.isFormSubmitted = true;
    if (this.schemeForm.valid) {
      const schemeData = this.schemeForm.value;

      this.httpService.postApiCall('/api/v1/scheme', schemeData).subscribe({
        next: (res) => {
          console.log('Scheme created successfully:', res);
          this.router.navigate(['/dashboard/plans'])
        },
        error: (error) => {
          console.error('Error creating scheme:', error);
        }
      });
    }
  }

  onClose(): void {
    this.router.navigate(['/dashboard/plans']); 
  }
}
