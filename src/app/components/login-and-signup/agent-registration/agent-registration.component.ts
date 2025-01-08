import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http-services/http.service';

@Component({
  selector: 'app-agent-registration',
  templateUrl: './agent-registration.component.html',
  styleUrls: ['./agent-registration.component.scss']
})
export class AgentRegistrationComponent {

  signupForm!: FormGroup
  uploadedFile: File | null = null;

  constructor(
    public httpService: HttpService,
    public formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AgentRegistrationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {

  }

  ngOnInit() {
    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phno: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      region: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)]],
      confirm: ['', [Validators.required]]
    })

}

get signupFormControls() { return this.signupForm.controls; }

handleRegistration(){
  if(this.signupForm.valid){

    const formData = new FormData();
      // Append the file
      if (this.uploadedFile) {
        formData.append('image', this.uploadedFile);
      }
    
      // Append other form fields
      Object.keys(this.signupForm.controls).forEach((key) => {
        console.log(key);
        
        if (key !== 'confirm') { // Skip the 'confirm' field
          const value = this.signupForm.get(key)?.value;
          if (value) {
            formData.append(key, value);
          }
        }
      });
             

      this.httpService.postApiCall(`/api/v1/agent/register`, formData).subscribe({
      next: (res) => {
        console.log(res)
        this.dialogRef.close();
        window.alert('Registration successfull');
      },
      error: (err) => {
        console.log(err)
      }
    })

  }
}

onFileChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.uploadedFile = input.files[0];
  }
}

}
