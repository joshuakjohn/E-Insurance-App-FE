import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { PROFILE_ICON } from 'src/assets/svg-icons';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss'],
})
export class CustomerDashboardComponent implements OnInit {
  activeTab: string = 'policies'; // Default tab
  username: string | null;
  email: string | null;

  tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'policies', label: 'Policies' },
    { key: 'paymentpendingpolices', label: 'Pending Payments' }
  ];

  constructor(
    public iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {
    // Register the profile icon
    iconRegistry.addSvgIconLiteral(
      'profile-icon',
      sanitizer.bypassSecurityTrustHtml(PROFILE_ICON)
    );

    // Fetch username and email from local storage
    this.username = localStorage.getItem('username');
    this.email = localStorage.getItem('email');

    // Listen to route changes to set activeTab
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateActiveTab(event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    // Initialize activeTab based on the current route
    this.updateActiveTab(this.router.url);
  }

  // Update activeTab based on the route
  private updateActiveTab(url: string): void {
    if (url.includes('/customerdashboard/profile')) {
      this.activeTab = 'profile';
    } else if (url.includes('/customerdashboard/policy')) {
      this.activeTab = 'policies';
    } else if (url.includes('/customerdashboard/pendingpayment')) {
      this.activeTab = 'paymentpendingpolices';
    } else {
      this.activeTab = 'policies'; // Fallback to default tab
    }
  }

  // Navigate to home page
  homeButtonEvent(): void {
    this.router.navigate(['/dashboard/plans']);
  }

  // Set activeTab and navigate
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'profile') {
      this.goToProfile();
    } else if (tab === 'policies') {
      this.router.navigate(['/customerdashboard/policy']);
    } else if (tab === 'paymentpendingpolices') {
      this.router.navigate(['/customerdashboard/pendingpayment']);
    }
  }

  // Clear localStorage and navigate to plans
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/dashboard/plans']);
  }

  // Navigate to profile page
  goToProfile(): void {
    this.router.navigate(['/customerdashboard/profile']);
  }

  // Navigate to dashboard
  goToDashboard(): void {
    this.router.navigate(['/dashboard/plans']);
  }
}
