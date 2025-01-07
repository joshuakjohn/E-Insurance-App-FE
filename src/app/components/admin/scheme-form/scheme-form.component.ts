import { HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  plans: any[] = [];

  header: HttpHeaders;
  constructor(private formBuilder: FormBuilder, private httpService: HttpService, private router: Router) {
    const authToken = localStorage.getItem('authToken');
        this.header = authToken
          ? new HttpHeaders().set('Authorization', `Bearer ${authToken}`)
          : new HttpHeaders();
        if (!authToken) {
          console.error('Authorization token is missing');
        }
  }

  ngOnInit(): void {
    this.schemeForm = this.formBuilder.group({
      schemeName: ['', Validators.required],
      planId: ['', Validators.required],
      description: ['', Validators.required],
      eligibilityCriteria: ['', Validators.required],
      premium: ['', Validators.required],
      maturityPeriod: ['', Validators.required],
      coverage: ['', Validators.required]
    });
    this.fetchPlans();
  }

  get SchemeFormControls() {
    return this.schemeForm.controls;
  }

  fetchPlans(): void {
    this.httpService.getAllPlan('/api/v1/plan').subscribe({
      next: (res: any) => {
        this.plans = res.data;
      },
      error: (err: any) => {
        console.error('Error fetching plans:', err);
      }
    });
  }

  handleSubmit() {
    this.isFormSubmitted = true;

    if (this.schemeForm.valid) {
      const schemeData = this.schemeForm.value;
      this.httpService.postApiCall('/api/v1/scheme', schemeData, this.header).subscribe({
        next: (res) => {
          console.log('Scheme created successfully:', res);
        },
        error: (error) => {
          console.error('Error creating scheme:', error);
        }
      });
    }
  }

  onClear(): void {
    this.schemeForm.reset();
    this.isFormSubmitted = false;
  }
}
