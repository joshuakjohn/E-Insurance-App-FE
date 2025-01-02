import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import  {MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginAndSignupComponent } from './components/login-and-signup/login-and-signup.component';
import { PlanComponent } from './components/plan/plan.component';
import { SchemeComponent } from './components/scheme/scheme.component';
import { PolicyComponent } from './components/policy/policy.component';
import { FormsModule } from '@angular/forms';
import { AdminComponent } from './components/admin/admin.component';
import { PlanFormComponent } from './components/admin/plan-form/plan-form.component';
import { SchemeFormComponent } from './components/admin/scheme-form/scheme-form.component';
import { PolicyViewComponent } from './components/policy-view/policy-view.component';
import { AgentComponent } from './components/agent/agent.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CustomerpolicyComponent } from './components/agent/customerpolicy/customerpolicy.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AgentPolicyComponent } from './components/admin-dashboard/agentpolicy/agentpolicy.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    LoginAndSignupComponent,
    PlanComponent,
    SchemeComponent,
    PolicyComponent,
    AdminComponent,
    PlanFormComponent,
    SchemeFormComponent,
    PolicyViewComponent,
    AgentComponent,
    CustomerDashboardComponent,
    ProfileComponent,
    CustomerpolicyComponent,
    AdminDashboardComponent,
    AgentPolicyComponent,
    AdminLoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
    BrowserAnimationsModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
