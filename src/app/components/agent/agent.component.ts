import { HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { HttpService } from 'src/app/services/http-services/http.service';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PROFILE_ICON } from 'src/assets/svg-icons';
import { Router } from '@angular/router';


@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})
export class AgentComponent {

  extendedCard: number | null = null;
  tab: string = 'customer';
  customers: any[] = [];
  agentPolices: any[] = [];
  customerPolicies: any[] = [];
  pendingPolicies: any[] = []
  height: string = ''
  email: string | null
  username: string | null

  constructor(public iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private httpService: HttpService, public dialog: MatDialog, public router: Router
  ){
    iconRegistry.addSvgIconLiteral('profile-icon', sanitizer.bypassSecurityTrustHtml(PROFILE_ICON));
    this.email = localStorage.getItem('email')
    this.username = localStorage.getItem('username')
  }

  ngOnInit(): void {
    this.fetchCustomers();
    this.fetchAgentPolicies()
  }

  fetchCustomers(): void {
    const header = new HttpHeaders().set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzY5NWJkOGRmMzdjZjE3ZDBjY2VhNDIiLCJlbWFpbCI6ImF2aUBnbWFpbC5jb20iLCJpYXQiOjE3MzU1NzM1MjYsImV4cCI6MTczNjE3ODMyNn0.j-dES4y5s04ZoTI-F6LuNfSpqfl8Cv-JQ9Sb3-ZkGm4`);
    this.httpService.getApiCall('/api/v1/customer', header).subscribe({
      next: (res: any) => {
        this.customers = res.data
      },
      error: (err: any) => {
        console.error('Error fetching plans:', err);
      },
    });
  }

  tabSwitch(input: string){
    if(input === 'customer')
      this.tab = 'customer'
    else if(input === 'policy'){
      this.tab = 'policy'
      this.pendingPolicies = this.agentPolices.filter((policy: any) => {
        if(policy.status === 'submitted')
          return true
        return false
      })
      this.pendingPolicies.map(policy => {
        const customer = this.customers.find(customer => {
          return customer._id === policy.customerId
        })
        policy.customerName = customer.username
        policy.customerEmail = customer.email
      })
    }
  }

  fetchAgentPolicies(): void {    
    const header = new HttpHeaders().set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzY5NWJkOGRmMzdjZjE3ZDBjY2VhNDIiLCJlbWFpbCI6ImF2aUBnbWFpbC5jb20iLCJpYXQiOjE3MzU1NzM1MjYsImV4cCI6MTczNjE3ODMyNn0.j-dES4y5s04ZoTI-F6LuNfSpqfl8Cv-JQ9Sb3-ZkGm4`);     
    this.httpService.getApiCall(`/api/v1/policy/agent`, header).subscribe({
      next: (res: any) => {
        this.agentPolices = res.data        
      },
      error: (err: any) => {
        console.error('Error fetching plans:', err);
      },
    });
  }

  viewCustomerPolicies(id: number){
      this.customerPolicies = this.agentPolices.filter((policy: any) => {        
        if(policy.customerId === id)
          return true
        return false
      })
      if(this.customerPolicies.length === 0)
        this.height = 50+'px'
      else
      this.height = this.customerPolicies.length*370+'px'      
      this.extendedCard = this.extendedCard === id ? null : id; 
  }

  forwardButton(policyId: string){
    this.httpService.patchApiCall(`/api/v1/policy/${policyId}`, {status: 'Waiting for approval'}).subscribe({
      next: (res: any) => {
        console.log(res)
      },
      error: (err: any) => {
        console.error('Error fetching plans:', err);
      },
    });
  }

  homeButtonEvent(){
    this.router.navigate([`/dashboard/plans`]);
  }

  logout(){
    localStorage.clear()
    this.router.navigate([`/dashboard/plans`]);
  }

  downloadPdf(pdf: ArrayBuffer) {
    console.log(pdf)

    const arrayBuffer = new Uint8Array(pdf).buffer;

    // Convert ArrayBuffer to Blob
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

    // Create a downloadable URL
    const url = window.URL.createObjectURL(blob);

    // Create an anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = 'policy.pdf'; // Set the desired file name
    document.body.appendChild(a);

    // Trigger the download
    a.click();

    // Clean up
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
