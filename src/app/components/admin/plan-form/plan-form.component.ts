import { HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http-services/http.service';

@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.component.html',
  styleUrls: ['./plan-form.component.scss']
})
export class PlanFormComponent {
  planForm!: FormGroup;
  isFormSubmitted = false;
  highlights: string[] = [];
  
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
    this.planForm = this.formBuilder.group({
      planName: ['', Validators.required],
      description: [''],
      category: ['', Validators.required]
    });
    this.addHighlight();
  }

  get planFormControls() {
    return this.planForm.controls;
  }

  addHighlight(): void {
    if (this.highlights.length < 5) {
      const highlightControlName = `highlight${this.highlights.length}`;
      this.planForm.addControl(highlightControlName, new FormControl(''));
      this.highlights.push(highlightControlName);
    }
  }

  removeHighlight(index: number): void {
    const highlightControlName = this.highlights[index];
    this.planForm.removeControl(highlightControlName);
    this.highlights.splice(index, 1);
  }


  handleSubmit() {
    this.isFormSubmitted = true;
    if (this.planForm.valid) {
      const { planName, description, category } = this.planForm.value;
      const highlights = this.highlights.map(h => this.planForm.get(h)?.value).filter(h => h);

      const payload: { planName: string; category: string; description?: string, highlight?: string[] } = {planName, category, highlight: highlights};
    
      // Add description if it's not empty
      if (description) {
        payload.description = description;
      }
      this.httpService.postApiCall('/api/v1/plan', payload, this.header).subscribe({
        next: (res) => {
          window.alert('Plan created successfully')
        },
        error: (error) => {
          console.error('Error creating plan:', error);
        },
      });
    }
  }

  onClear(): void {
    this.planForm.reset();
    this.isFormSubmitted = false;
  }
}
