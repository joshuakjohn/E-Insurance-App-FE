import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { PlanComponent } from './components/plan/plan.component';
import { SchemeComponent } from './components/scheme/scheme.component';
import { PolicyComponent } from './components/policy/policy.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard/plans',
    pathMatch: 'full', 
  },
  {
    path: 'dashboard', 
    component: HomePageComponent,
    children: [
      { path: 'plans', component: PlanComponent },
      { path: 'plans/:planId/scheme', component: SchemeComponent },
      { path: 'plans/:planId/scheme/:schmeId/policy', component: PolicyComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
