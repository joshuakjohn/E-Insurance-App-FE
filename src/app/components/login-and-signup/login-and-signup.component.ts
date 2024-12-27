import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-and-signup',
  templateUrl: './login-and-signup.component.html',
  styleUrls: ['./login-and-signup.component.scss']
})
export class LoginAndSignupComponent {

  signinForm!: FormGroup;
  signupForm!: FormGroup

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<LoginAndSignupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit() {
      this.signupForm = this.formBuilder.group({
        signup_role: ['', [Validators.required]],
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        age: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        region: ['', [Validators.required]],
        image: [''],
        password: ['', [Validators.required]],
        confirm: ['', [Validators.required]]
      }, {updateOn: 'submit'})
    

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
      const { signup_role, name, email, password, phone, age, region, image } = this.signupForm.value
      console.log(this.signupForm.value)
  }

  handleSignin(){
    const { signin_role, email, password} = this.signinForm.value
    console.log(this.signinForm.value)
}

}
