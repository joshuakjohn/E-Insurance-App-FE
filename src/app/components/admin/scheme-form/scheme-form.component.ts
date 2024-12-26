import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-scheme-form',
  templateUrl: './scheme-form.component.html',
  styleUrls: ['./scheme-form.component.scss']
})
export class SchemeFormComponent {
  schemeForm!: FormGroup;
  
    constructor(private formBuilder: FormBuilder){}
  
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
}
