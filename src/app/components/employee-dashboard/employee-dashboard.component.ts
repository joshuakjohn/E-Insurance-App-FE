import { HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { HttpService } from 'src/app/services/http-services/http.service';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PROFILE_ICON } from 'src/assets/svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent {
  tab: string = 'plans';
  agents: any[] = [];
  plans: any[] = [];
  pendingAgents: any[] = [];
  customers: any[] = []; 

  employeeEmail: string = '';
  employeeUsername: string = '';

  isSchemesVisible: { [planId: string]: boolean } = {};
  expandedAgentId: string | null = null; 

  constructor(public iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private httpService: HttpService, public dialog: MatDialog, public router: Router) {
    iconRegistry.addSvgIconLiteral('profile-icon', sanitizer.bypassSecurityTrustHtml(PROFILE_ICON));
  }

  ngOnInit(): void {
    this.fetchAgents();
    this.loadEmployeeDetails();
    this.fetchPendingAgents();
    this.tabSwitch('allPlans');
  }

  tabSwitch(input: string) {
    this.tab = input;
  
    const routes: { [key: string]: string } = {
      allPlans: '/employee/dashboard/browse-plans',
      agent: '/employee/dashboard/browse-agents',
      approveAgent: '/employee/dashboard/approve-agents',
    };
  
    if (routes[input]) {
      this.router.navigate([routes[input]]);
    }
  
    if (input === 'allPlans') {
      this.fetchAllPlans();
    } else if (input === 'agent'  && this.agents.length === 0) {
      this.fetchAgents();
    } else if (input === 'approveAgent' && this.pendingAgents.length === 0) {
      this.fetchPendingAgents();
    }
  }

  loadEmployeeDetails(): void {
    this.employeeEmail = localStorage.getItem('email') || 'employee@example.com';
    this.employeeUsername = localStorage.getItem('username') || 'Employee';
  }
  
  fetchAllPlans(): void {
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    this.httpService.getApiCall('/api/v1/plan', header).subscribe({
      next: (res: any) => {
        this.plans = res.data;
      },
      error: (err: any) => {
        console.error('Error fetching plans:', err);
      },
    });
  }

  viewSchemes(planId: string): void {
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    if (!this.isSchemesVisible[planId]) {
      this.httpService.getApiCall(`/api/v1/scheme/${planId}/getall`, header).subscribe({
        next: (res: any) => {
          const index = this.plans.findIndex(plan => plan._id === planId);
          if (index !== -1) {
            this.plans[index].schemes = res.data; // Attach schemes to the specific plan
          }
          this.isSchemesVisible[planId] = !this.isSchemesVisible[planId];
        },
        error: (err: any) => {
          console.error('Error fetching schemes:', err);
        },
      });
    } else {
      this.isSchemesVisible[planId] = !this.isSchemesVisible[planId];
    }
  }

  viewAgentCustomers(agentId: string): void {
    if (this.expandedAgentId === agentId) {
        // Collapse customer list
        this.expandedAgentId = null;
        this.customers = [];
    } else {
        // Expand and fetch customers
        this.expandedAgentId = agentId;
        const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
        this.httpService.getApiCall(`/api/v1/customer/${agentId}/employee`, header).subscribe({
            next: (res: any) => {
                this.customers = res.data; // Populate customers array
            },
            error: (err: any) => {
                console.error('Error fetching customers:', err);
                this.customers = []; // Reset customers on error
            },
        });
    }
}

  fetchAgents(): void {
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    this.httpService.getApiCall('/api/v1/agent/employee', header).subscribe({
      next: (res: any) => {
        this.agents = res.data;
      },
      error: (err: any) => {
        console.error('Error fetching agents:', err);
      },
    });
  }
  
  fetchPendingAgents(): void {
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    this.httpService.getApiCall('/api/v1/agent/employee', header).subscribe({
        next: (res: any) => {
            this.pendingAgents = res.data.filter((agent: any) => agent.status === 'Waiting for approval');
        },
        error: (err: any) => {
            console.error('Error fetching pending agents:', err);
        },
    });
  }

  approveAgent(agentId: string): void {
    this.httpService.patchApiCall(`/api/v1/agent/${agentId}`, { status: 'Approved' }).subscribe({
      next: (res: any) => {
        console.log(res);
        this.pendingAgents = this.pendingAgents.filter(agent => agent._id !== agentId);
      },
      error: (err: any) => {
        console.error('Error approving agent:', err);
      },
    });
  }

  homeButtonEvent() {
    this.router.navigate([`/dashboard/plans`]);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/dashboard/plans']);
  }

}
