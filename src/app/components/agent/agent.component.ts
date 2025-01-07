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

  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 3;

  constructor(public iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private httpService: HttpService, public dialog: MatDialog, public router: Router
  ){
    iconRegistry.addSvgIconLiteral('profile-icon', sanitizer.bypassSecurityTrustHtml(PROFILE_ICON));
    this.email = localStorage.getItem('email')
    this.username = localStorage.getItem('username')
  }

  ngOnInit(): void {
    this.fetchCustomers();
    this.fetchAgentPolicies();
    console.log('Current Page:', this.currentPage);
    console.log('Total Pages:', this.totalPages);
  }

  fetchCustomers(): void {
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    const params = { page: this.currentPage.toString(), limit: this.limit.toString() };
    this.httpService.getApiCall('/api/v1/customer', header, params).subscribe({
        next: (res: any) => {
          console.log('Fetched Data:', res);
            this.customers = res.data;
            this.totalPages = res.totalPages;
        },
        error: (err: any) => {
            console.error('Error fetching customers:', err);
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
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);     
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

  prevPage(): void {
    if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchCustomers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchCustomers();
    }
  }
}
