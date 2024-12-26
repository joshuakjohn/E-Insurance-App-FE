import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlanDialogComponent } from '../plan-dialog/plan-dialog.component';

@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.component.html',
  styleUrls: ['./plan-form.component.scss']
})
export class PlanFormComponent {
  constructor(private dialog: MatDialog) {}

  openDialog(): void {
    this.dialog.open(PlanDialogComponent, {
      width: '400px',
      height: 'auto',
      disableClose: true
    });
  }
}


















// import { Component, Inject } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { HttpService } from 'src/app/services/http-service/http.service';

// @Component({
//   selector: 'app-plan-form',
//   templateUrl: './plan-form.component.html',
//   styleUrls: ['./plan-form.component.scss']
// })
// export class PlanFormComponent {
//   planForm!: FormGroup;
//   // dialog: any;

//   constructor(private formBuilder: FormBuilder, private httpService: HttpService, public dialog: MatDialogRef<any>){}

//   ngOnInit(): void {
//     this.planForm = this.formBuilder.group({
//       planName: ['', Validators.required],
//       description: [''],
//       category: ['', Validators.required]
//     });
//   }

//   get planFormControls() {
//     return this.planForm.controls;
//   }

//   handleSubmit() {
//     if (this.planForm.valid) {
//       const { planName, description, category } = this.planForm.value;
  
//       const payload: { planName: string; category: string; description?: string } = {planName, category};

//       // Add description if it's not empty
//       if (description) {
//         payload.description = description;
//       }
  
//       this.httpService.postApiCall('/api/v1/plan', payload).subscribe({
//         next: (response) => {
//           console.log('Plan created successfully:', response);
//         },
//         error: (error) => {
//           console.error('Error creating plan:', error);
//         }
//       });
//     }
//   }

//   openDialog(): void {
//     this.dialog.open( {
//       width: '400px',
//       disableClose: true
//     });
//   }
// }
