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

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard/plans',
    pathMatch: 'full', 
  },
  {
    path: 'customerdashboard', 
    component: CustomerDashboardComponent, 
    children: [
      {
        path: 'policy',  
        component: PolicyViewComponent
      },
      {path:'profile',
        component:ProfileComponent
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
        component: AdminDashboardComponent,
        children: [
          { path: 'add-plan', component: PlanFormComponent },
          { path: 'add-scheme', component: SchemeFormComponent },
          { path: '', component: PlanFormComponent },
          {path:'browse-plans',component:AdminDashboardComponent}
        ]
      },
    ]
  },
  { path: 'agent', component: AgentComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes,{ 
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
