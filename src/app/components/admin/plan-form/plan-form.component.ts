import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.component.html',
  styleUrls: ['./plan-form.component.scss']
})
export class PlanFormComponent {
  planForm!: FormGroup;

  constructor(private formBuilder: FormBuilder){}

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

}
