import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent {
  isSidebarOpen = false;

  constructor(private router:Router){}
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
   navigateToProfile() {
    this.router.navigate(['/customerdashboard/profile'])
}
}
