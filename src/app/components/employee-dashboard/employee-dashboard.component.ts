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
  policies: any[] = [];
  pendingPolicies: any[] = [];
  pendingAgents: any[] = [];

  employeeEmail: string = '';
  employeeUsername: string = '';

  isSchemesVisible: { [planId: string]: boolean } = {};
  expandedAgentId: string | null = null; 

  constructor(public iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private httpService: HttpService, public dialog: MatDialog, public router: Router) {
    iconRegistry.addSvgIconLiteral('profile-icon', sanitizer.bypassSecurityTrustHtml(PROFILE_ICON));
  }

  ngOnInit(): void {
    this.fetchAgents();
    this.loadAdminDetails();
    this.fetchPendingAgents();
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
    } else if (input === 'agent') {
      this.fetchAgents();
    } else if (input === 'approveAgent') {
      this.fetchPendingAgents();
    }
  }

  loadAdminDetails(): void {
    this.employeeEmail = localStorage.getItem('email') || 'employee@example.com';
    this.employeeUsername = localStorage.getItem('username') || 'Employee';
  }
  
  fetchAllPlans(): void {
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    this.httpService.getApiCall('/api/v1/plan', header).subscribe({
      next: (res: any) => {
        console.log(res);
        
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
    this.httpService.getApiCall('/api/v1/agent', header).subscribe({
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
  
  viewAgentPolicies(agentId: string): void {
    if (this.expandedAgentId === agentId) {
        // Collapse the policies if the agent is already expanded
        this.expandedAgentId = null;
        this.policies = [];
    } else {
        // Fetch and expand policies for the selected agent
        this.expandedAgentId = agentId;
        const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken') || ''}`);
        this.httpService.getApiCall(`/api/v1/policy/${agentId}`, header).subscribe({
            next: (res: any) => {
                console.log('Policies fetched:', res.data);
                this.policies = res.data; // Populate the policies array
            },
            error: (err: any) => {
                console.error('Error fetching policies:', err);
                this.policies = []; // Reset policies on error
            },
        });
    }
}

  homeButtonEvent() {
    this.router.navigate([`/dashboard/plans`]);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/dashboard/plans']);
  }

}
