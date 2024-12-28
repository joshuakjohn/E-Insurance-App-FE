import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpLoginService } from '../../services/http-services/http-login.service';

@Component({
  selector: 'app-login-and-signup',
  templateUrl: './login-and-signup.component.html',
  styleUrls: ['./login-and-signup.component.scss']
})
export class LoginAndSignupComponent {

  role: string = 'Customer'

  signinForm!: FormGroup;
  signupForm!: FormGroup

  constructor(
    public httpService: HttpLoginService,
    public formBuilder: FormBuilder,
    public cdr: ChangeDetectorRef,
    public dialogRef: MatDialogRef<LoginAndSignupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit() {
      this.signupForm = this.formBuilder.group({
        signup_role: ['', [Validators.required]],
        username: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phno: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        age: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        region: ['', [Validators.required]],
        image: [''],
        password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)]],
        confirm: ['', [Validators.required]]
      })
    

    this.signinForm = this.formBuilder.group({
      signin_role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    })
}

get signupFormControls() { return this.signupForm.controls; }

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
      });

      signInButton.addEventListener('click', () => {
        container.classList.remove('right-panel-active');
      });
    }
  }

  handleRegistration(){
    if(this.signupForm.valid){
      const { signup_role, username, email, password, phno, age, region, image } = this.signupForm.value
      if(signup_role === 'Customer'){
        this.httpService.postApiCall(`/api/v1/customer/register`, {username, email, password, phno, age, region}).subscribe({
        next: (res) => {
          console.log(res)
        },
        error: (err) => {
          console.log(err)
        }
      })
      }
    }
  }

  handleSignin(){
    if(this.signinForm.valid){
      console.log(this.signinForm.value)
      const { signin_role, email, password} = this.signinForm.value
      const role_lower = signin_role.toLowerCase()
      this.httpService.postApiCall(`/api/v1/${role_lower}`, {email, password}).subscribe({
        next: (res) => {
          console.log(res)
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  }

  onRoleChange(newRole: string) {
    console.log('Role changed to:', newRole);
    this.role = newRole;
  }

}
