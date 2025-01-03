import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent {
  tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'profile', label: 'Profile' },
    { key: 'policies', label: 'Policies' },
    { key: 'reports', label: 'Reports' },
  ];

  // State
  activeTab: string = 'overview'; // Default tab
  userName: string = 'John Doe';
  userEmail: string = 'john.doe@example.com';
  constructor(private router: Router) {}

  // Methods
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'profile') {
      this.goToProfile();
    }
    else if(tab==='policies')
      this.router.navigate(['/customerdashboard/policy'])
  }

 

  logout(): void {
    localStorage.clear()
    this.router.navigate([`/dashboard/plans`]);
  }

  goToProfile(): void {
    this.router.navigate(['/customerdashboard/profile']);
  }
  goToDashboard(){
    this.router.navigate([`/dashboard/plans`]);
  }
}
