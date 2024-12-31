import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { PlanComponent } from './components/plan/plan.component';
import { SchemeComponent } from './components/scheme/scheme.component';
import { PolicyComponent } from './components/policy/policy.component';
import { PolicyViewComponent } from './components/policy-view/policy-view.component';
import { AgentComponent } from './components/agent/agent.component';
import { CustomerDashboardComponent } from './components/customer-dashboard/customer-dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';

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
  { path: 'agent', component: AgentComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
