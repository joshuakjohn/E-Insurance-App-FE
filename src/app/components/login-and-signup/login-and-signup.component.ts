import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../services/http-services/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-and-signup',
  templateUrl: './login-and-signup.component.html',
  styleUrls: ['./login-and-signup.component.scss']
})
export class LoginAndSignupComponent {

  role: string = 'Customer'
  loginErrorMessage: string = ''
  uploadedFile: File | null = null;
  filteredRegions: string[] = []; 
  signupFormToggled: boolean = false;

  signinForm!: FormGroup;
  signupForm!: FormGroup;

  constructor(
    public httpService: HttpService,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<LoginAndSignupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public router:Router
  ) {

  }

  ngOnInit() {
      this.signupForm = this.formBuilder.group({
        username: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phno: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        age: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        gender:['',[Validators.required]],
        region: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)]],
        confirm: ['', [Validators.required]]
      })
    

    this.signinForm = this.formBuilder.group({
      signin_role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
}

get signupFormControls() {
   return this.signupForm.controls; }

get signinFormControls() { return this.signinForm.controls; }


  onNoClick(): void {
    this.dialogRef.close();
  }

  ngAfterViewInit(): void {
    const signUpButton = document.getElementById('signUp') as HTMLButtonElement;
    const signInButton = document.getElementById('signIn') as HTMLButtonElement;
    const container = document.getElementById('container') as HTMLDivElement;

    if (signUpButton && signInButton && container) {
      signUpButton.addEventListener('click', () => {
        container.classList.add('right-panel-active');
        if (!this.signupFormToggled) {
          this.fetchAgentRegion(); 
          this.signupFormToggled = true; 
        }
      });

      signInButton.addEventListener('click', () => {
        container.classList.remove('right-panel-active');
      });
    }
  }
  fetchAgentRegion() {
    this.httpService.getAgentRegion('/api/v1/agent/getregion').subscribe({
      next: (res: any) => {
        if (res.data) {
          this.filteredRegions = res.data.split(',').map((region: string) => region.trim());
        }
      },
      error: (err) => console.error(err)
    });
  }
  handleRegistration(){
    if(this.signupForm.valid){
      console.log(this.signinFormControls)
        const formData = new FormData();
        // Append the file
        if (this.uploadedFile) {
          formData.append('image', this.uploadedFile);
        }
      
        // Append other form fields
        Object.keys(this.signupForm.controls).forEach((key) => {
          if (key !== 'confirm') { // Skip the 'confirm' field
            const value = this.signupForm.get(key)?.value;
            if (value) {
              formData.append(key, value);
            }
          }
        });          

        this.httpService.postApiCall(`/api/v1/customer/register`, formData).subscribe({
        next: (res) => {
          this.dialogRef.close();
          window.alert('Registration successfull');
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  }

  handleSignin() {
    if (this.signinForm.valid) {
      const { signin_role, email, password } = this.signinForm.value;
      const role_lower = signin_role.toLowerCase();
  
      this.httpService.postApiCall(`/api/v1/${role_lower}`, { email, password }).subscribe({
        next: (res: any) => {
          localStorage.setItem('authToken', res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('email', res.email);
          localStorage.setItem('role', role_lower); 
          
          function bufferToBase64(buffer: any) {
            let binary = '';
            let bytes = new Uint8Array(buffer);
            let length = bytes.length;
          
            for (let i = 0; i < length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
          
            return window.btoa(binary); // Return the Base64 encoded string
          }
          
          if(res.profilePhoto){
            // Get the Base64 encoded image
            const base64Image = "data:image/png;base64," + bufferToBase64(res.profilePhoto.data);
          
            // Save it to localStorage (if needed)
            localStorage.setItem("profileImage", base64Image);
          }
          
          this.dialogRef.close(role_lower);
        },
        error: (err) => {
          console.log(err);
            if(err.error.message === 'Agent not approved')
              this.loginErrorMessage = '*Agent not approved'
            else
              this.loginErrorMessage = '*invalid email or password'
        }
      });
    }
  }
  
  
  onRoleChange(newRole: string) {
    this.role = newRole;
    this.updateConditionalFields()
  }

  updateConditionalFields() {
    // Handle `age` field
    if (this.role === 'Customer') {
      this.signupForm.get('age')?.setValidators([Validators.required, Validators.pattern('^[0-9]+$')]);
    } else {
      this.signupForm.get('age')?.clearValidators();
    }
    this.signupForm.get('age')?.updateValueAndValidity();

    // Handle `region` field
    if (this.role === 'Customer' || this.role === 'Agent') {
      this.signupForm.get('region')?.setValidators([Validators.required]);
    } else {
      this.signupForm.get('region')?.clearValidators();
    }
    this.signupForm.get('region')?.updateValueAndValidity();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadedFile = input.files[0];
    }
  }

}
