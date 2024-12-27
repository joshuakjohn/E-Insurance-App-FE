import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http-service/http.service';

@Component({
  selector: 'app-scheme-form',
  templateUrl: './scheme-form.component.html',
  styleUrls: ['./scheme-form.component.scss']
})
export class SchemeFormComponent {
  schemeForm!: FormGroup;
  isFormSubmitted = false;

  constructor(private formBuilder: FormBuilder, private httpService: HttpService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.schemeForm = this.formBuilder.group({
      schemeName: ['', Validators.required],
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
        next: (response) => {
          console.log('Scheme created successfully:', response);
          this.dialog.closeAll();
        },
        error: (error) => {
          console.error('Error creating scheme:', error);
        }
      });
    }
  }

  onClose(): void {
    this.dialog.closeAll();
  }
}
