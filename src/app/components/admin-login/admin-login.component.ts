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
      signin_role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get loginFormControls() {
    return this.loginForm.controls;
  }

  handleLogin() {
    if (this.loginForm.valid) {
      const { signin_role, email, password } = this.loginForm.value;
      const role_lower = signin_role.toLowerCase();

      this.httpService.postApiCall(`/api/v1/${role_lower}`, { email, password }).subscribe({
        next: (res: any) => {
          localStorage.setItem('authToken', res.token);
          localStorage.setItem('username', res.username);
          localStorage.setItem('email', res.email);
          localStorage.setItem('role', role_lower);

          if (role_lower === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role_lower === 'employee') {
            this.router.navigate(['/employee/dashboard']);
          }
        },
        error: (err) => {
          console.error('Login error:', err);
        }
      });
    }
  }
}
