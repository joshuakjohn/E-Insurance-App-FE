import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from 'src/app/services/http-services/http.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  loginForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private httpService: HttpService, private router: Router) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Convenience getter for easy access to form fields
  get loginFormControls() { return this.loginForm.controls; }

  handleLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      console.log('hello')

      this.httpService.postApiCall('/api/v1/admin', { email, password }).subscribe({
        next: (res:any) => {
          console.log(res);
          localStorage.setItem('authToken', res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('email', res.email);
          this.router.navigate(['/admin/dashboard']);
        },
        error: (err) => {
          console.error(err);
        }
      });
    }
  }
}

interface LoginResponse {
  code: number;
  token: string;
  email: string;
  username: string; 
  message: string;
}
