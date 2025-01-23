import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { PlanComponent } from './components/plan/plan.component';
import { SchemeComponent } from './components/scheme/scheme.component';
import { PolicyComponent } from './components/policy/policy.component';
import { PlanFormComponent } from './components/admin/plan-form/plan-form.component';
import { SchemeFormComponent } from './components/admin/scheme-form/scheme-form.component';
import { PolicyViewComponent } from './components/policy-view/policy-view.component';
import { AgentComponent } from './components/agent/agent.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { PendingPaymentPoliciesComponent } from './components/pending-payment-policies/pending-payment-policies.component';
import { AuthGuardService } from './services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard/plans',
    pathMatch: 'full', 
  },
  { path: 'contact', 
    component: ContactComponent 
  },
  { path: 'about', 
    component: AboutComponent 
  },
  {
    path: 'customerdashboard', 
    component: CustomerDashboardComponent, canActivate: [AuthGuardService], data: { roles: ['customer'] },
    children: [
      {
        path: 'policy',  
        component: PolicyViewComponent
      },
      {path:'profile',
        component:ProfileComponent
      },
      {
        path:'pendingpayment',
        component:PendingPaymentPoliciesComponent
      }

    ]
  },
  {
    path: 'dashboard', 
    component: HomePageComponent,
    children: [
      { path: 'plans', component: PlanComponent },
      { path: 'plans/:planId/scheme', component: SchemeComponent },
      { path: 'plans/:planId/scheme/:schemeId/policy', component: PolicyComponent },
      { path: 'plans/:planId/scheme/:schemeId/policy/view', component: PolicyViewComponent },
    ]
  },
  {
    path: 'admin',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: AdminLoginComponent },
      { 
        path: 'dashboard', 
        component: AdminDashboardComponent, canActivate: [AuthGuardService], data: { roles: ['admin'] },
        children: [
          { path: '', redirectTo: 'browse-plans', pathMatch: 'full' }, // Default tab route
          { path: 'browse-plans', component: AdminDashboardComponent }, 
          { path: 'add-plan', component: PlanFormComponent },
          { path: 'add-scheme', component: SchemeFormComponent },
          { path: 'browse-agents', component: AdminDashboardComponent }, 
          { path: 'pending-policies', component: AdminDashboardComponent }, 
          { path: 'approve-agents', component: AdminDashboardComponent }
        ]
      },
    ]
  },
  {
    path: 'employee',
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: AdminLoginComponent },
      { 
        path: 'dashboard', 
        component: EmployeeDashboardComponent, canActivate: [AuthGuardService], data: { roles: ['employee'] },
        children: [
          { path: '', redirectTo: 'browse-plans', pathMatch: 'full' }, // Default tab route
          { path: 'browse-plans', component: EmployeeDashboardComponent}, 
          { path: 'browse-agents', component: EmployeeDashboardComponent }, 
          { path: 'approve-agents', component: EmployeeDashboardComponent }
        ]
      },
    ]
  },
  { path: 'agent', component: AgentComponent, canActivate: [AuthGuardService], data: { roles: ['agent'] },
    children:[
      {path:'customers',component:AgentComponent},
      {path:'pendingPolicies',component:AgentComponent},
      {path:'profile',component:AgentComponent},
    ]
   }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{ 
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
