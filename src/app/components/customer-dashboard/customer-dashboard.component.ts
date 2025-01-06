import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PROFILE_ICON } from 'src/assets/svg-icons';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent {

  activeTab: string = 'policies'; // Default tab
  username: string | null
  email: string | null

  constructor(public iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private router: Router){
    iconRegistry.addSvgIconLiteral('profile-icon', sanitizer.bypassSecurityTrustHtml(PROFILE_ICON));
    this.username = localStorage.getItem('username')
    this.email = localStorage.getItem('email')
  }

  homeButtonEvent(){
    this.router.navigate([`/dashboard/plans`]);
  }

  tabs = [
    { key: 'policies', label: 'Policies' },
    { key: 'profile', label: 'Profile' },
    { key: 'reports', label: 'Reports' },
  ];

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
