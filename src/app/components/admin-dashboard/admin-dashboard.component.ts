import { HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { HttpService } from 'src/app/services/http-services/http.service';
import { AgentPolicyComponent } from './agentpolicy/agentpolicy.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PROFILE_ICON } from 'src/assets/svg-icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {

  tab: string = 'plans';
  agents: any[] = [];
  plans: any[] = [];
  pendingPolicies: any[] = [];
  pendingAgents: any[] = [];

  adminEmail: string = '';
  adminUsername: string = '';

  showPlanForm: boolean = false;
  showSchemeForm: boolean = false;

  constructor(public iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private httpService: HttpService, public dialog: MatDialog, public router: Router) {
    iconRegistry.addSvgIconLiteral('profile-icon', sanitizer.bypassSecurityTrustHtml(PROFILE_ICON));
  }

  ngOnInit(): void {
    this.fetchAgents();
    this.fetchPendingPolicies();
    this.loadAdminDetails();
    this.fetchPendingAgents();
    this.tabSwitch('allPlans');
  }

  tabSwitch(input: string) {
    this.tab = input;
  
    const routes: { [key: string]: string } = {
      allPlans: '/admin/dashboard/browse-plans',
      agent: '/admin/dashboard/browse-agents',
      policy: '/admin/dashboard/pending-policies',
      plan: '/admin/dashboard/add-plan',
      scheme: '/admin/dashboard/add-scheme',
      approveAgent: '/admin/dashboard/approve-agents',
    };
  
    if (routes[input]) {
      this.router.navigate([routes[input]]);
    }
  
    if (input === 'allPlans') {
      this.fetchAllPlans();
    } else if (input === 'policy') {
      this.fetchPendingPolicies();
    } else if (input === 'agent') {
      this.fetchAgents();
    } else if (input === 'approveAgent') {
      this.fetchPendingAgents();
    }
  }
  

  loadAdminDetails(): void {
    this.adminEmail = localStorage.getItem('email') || 'admin@example.com';
    this.adminUsername = localStorage.getItem('username') || 'Admin';
  }

  navigateToAddPlan() {
    this.showPlanForm = true;
    this.showSchemeForm = false;
  }

  navigateToAddScheme() {
    this.showSchemeForm = true;
    this.showPlanForm = false;
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
    this.httpService.getApiCall(`/api/v1/scheme/${planId}/getall`, header).subscribe({
      next: (res: any) => {
        const index = this.plans.findIndex(plan => plan._id === planId);
        if (index !== -1) {
          this.plans[index].schemes = res.data; // Attach schemes to the specific plan
        }
      },
      error: (err: any) => {
        console.error('Error fetching schemes:', err);
      },
    });
  }

  fetchAgents(): void {
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    this.httpService.getApiCall('/api/v1/agent', header).subscribe({
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
            this.pendingAgents = res.data.filter((agent: any) => agent.status !== 'Approved');
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

  fetchPendingPolicies(): void {
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    this.httpService.getApiCall('/api/v1/policy/admin', header).subscribe({
      next: (res: any) => {
        this.pendingPolicies = res.data.filter((policy: any) => policy.status !== 'Approved');
      },
      
      error: (err: any) => {
        console.error('Error fetching pending policies:', err);
      },
    });
  }
  
  viewAgentPolicies(agentId: string) {
    const dialogRef = this.dialog.open(AgentPolicyComponent, {
      height: '600px',
      width: '1000px',
      data: { agentId: agentId },
    });
  
    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }
  
  approvePolicy(policyId: string) {
    this.httpService.patchApiCall(`/api/v1/policy/${policyId}`, {status: 'Approved'}).subscribe({
      next: (res: any) => {
        console.log(res);
        this.pendingPolicies = this.pendingPolicies.filter((policy) => policy._id !== policyId);
      },
      error: (err: any) => {
        console.error('Error approving policy:', err);
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