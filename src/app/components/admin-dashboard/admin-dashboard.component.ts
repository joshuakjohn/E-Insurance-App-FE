import { HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { HttpService } from 'src/app/services/http-services/http.service';
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
  customers: any[] = [];
  policies: any[] = [];
  pendingPolicies: any[] = [];
  pendingAgents: any[] = [];

  showAdminTabs: { [key: string]: boolean } = { plan: false, scheme: false, policy: false };

  adminEmail: string = '';
  adminUsername: string = '';

  showPlanForm: boolean = false;
  showSchemeForm: boolean = false;

  activePlanId: string | null = null;
  isViewingPolicies: { [agentId: string]: boolean } = {};
  isViewingCustomers: { [agentId: string]: boolean } = {};
  currentlyViewingAgent: string | null = null;

  constructor(public iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private httpService: HttpService, public dialog: MatDialog, public router: Router) {
    iconRegistry.addSvgIconLiteral('profile-icon', sanitizer.bypassSecurityTrustHtml(PROFILE_ICON));
  }

  ngOnInit(): void {
    this.fetchAgents();
    this.fetchPendingPolicies();
    this.loadAdminDetails();
    this.tabSwitch('allPlans');
  }

  revealTabs(tabName: string): void {
    if (tabName === 'plan') {
        this.showPlanForm = true;
        this.showSchemeForm = false;
    } else if (tabName === 'scheme') {
        this.showSchemeForm = true;
        this.showPlanForm = false;
    }
    this.showAdminTabs[tabName] = true;
}
  
  closeForm(): void {
    this.showPlanForm = false;
    this.showSchemeForm = false;
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
        this.plans = res.data;
      },
      error: (err: any) => {
        console.error('Error fetching plans:', err);
      },
    });
  }

  viewSchemes(planId: string): void {
    if (this.activePlanId === planId) {
      // Clicking the same plan again - hide schemes
      this.activePlanId = null;
      return;
    }

    // Show schemes for the new plan
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    this.httpService.getApiCall(`/api/v1/scheme/${planId}/getall`, header).subscribe({
      next: (res: any) => {
        const index = this.plans.findIndex(plan => plan._id === planId);
        if (index !== -1) {
          this.plans[index].schemes = res.data;
        }
        this.activePlanId = planId;
      },
      error: (err: any) => {
        console.error('Error fetching schemes:', err);
        this.activePlanId = null;
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

  fetchPendingPolicies(): void {
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    this.httpService.getApiCall('/api/v1/policy/admin', header).subscribe({
      next: (res: any) => {
        this.pendingPolicies = res.data.filter((policy: any) => policy.status === 'Waiting for approval');
      },
      
      error: (err: any) => {
        console.error('Error fetching pending policies:', err);
      },
    });
  }
  
  viewAgentPolicies(agentId: string): void {
    // If already viewing policies for this agent, hide them
    if (this.isViewingPolicies[agentId]) {
      this.isViewingPolicies[agentId] = false;
      this.policies = [];
      this.currentlyViewingAgent = null;
      return;
    }

    // If viewing anything for another agent, hide it
    if (this.currentlyViewingAgent && this.currentlyViewingAgent !== agentId) {
      this.isViewingPolicies[this.currentlyViewingAgent] = false;
      this.isViewingCustomers[this.currentlyViewingAgent] = false;
    }

    // Hide customers if they're being shown for this agent
    this.isViewingCustomers[agentId] = false;
    this.customers = [];

    // Show policies
    this.isViewingPolicies[agentId] = true;
    this.currentlyViewingAgent = agentId;

    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken') || ''}`);
    this.httpService.getApiCall(`/api/v1/policy/${agentId}`, header).subscribe({
      next: (res: any) => {
        this.policies = res.data;
      },
      error: (err: any) => {
        console.error('Error fetching policies:', err);
        this.policies = [];
      },
    });
  }

  viewAgentCustomers(agentId: string): void {
    // If already viewing customers for this agent, hide them
    if (this.isViewingCustomers[agentId]) {
      this.isViewingCustomers[agentId] = false;
      this.customers = [];
      this.currentlyViewingAgent = null;
      return;
    }

    // If viewing anything for another agent, hide it
    if (this.currentlyViewingAgent && this.currentlyViewingAgent !== agentId) {
      this.isViewingPolicies[this.currentlyViewingAgent] = false;
      this.isViewingCustomers[this.currentlyViewingAgent] = false;
    }

    // Hide policies if they're being shown for this agent
    this.isViewingPolicies[agentId] = false;
    this.policies = [];

    // Show customers
    this.isViewingCustomers[agentId] = true;
    this.currentlyViewingAgent = agentId;

    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    this.httpService.getApiCall(`/api/v1/customer/${agentId}/admin`, header).subscribe({
      next: (res: any) => {
        this.customers = res.data;
      },
      error: (err: any) => {
        console.error('Error fetching customers:', err);
        this.customers = [];
      },
    });
  }
  
  approvePolicy(policyId: string) {
    this.httpService.patchApiCall(`/api/v1/policy/${policyId}`, {status: 'Active'}).subscribe({
      next: (res: any) => {
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