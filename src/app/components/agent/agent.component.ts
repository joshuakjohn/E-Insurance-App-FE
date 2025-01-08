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
  agent: any
  profilePicUrl: string = '';

  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 3;
  loader:string = 'flex' 


  constructor(public iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private httpService: HttpService, public dialog: MatDialog, public router: Router
  ){
    iconRegistry.addSvgIconLiteral('profile-icon', sanitizer.bypassSecurityTrustHtml(PROFILE_ICON));
    this.email = localStorage.getItem('email')
    this.username = localStorage.getItem('username')
  }

  ngOnInit(): void {
    this.fetchCustomers();
    this.fetchAgentPolicies()
    this.fetchAgentById()
    
  }

  fetchAgentById(): void{
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    this.httpService.getApiCall('/api/v1/agent/get-agent', header).subscribe({
      next: (res: any) => {
        this.agent = res.data
        this.createImageFromBuffer(res.data.profilePhoto);
      },
      error: (err: any) => {
        console.error('Error fetching agent:', err);
      },
    });
  }

  fetchCustomers(): void {
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    const params = { page: this.currentPage.toString(), limit: this.limit.toString() };
    this.httpService.getApiCall('/api/v1/customer', header, params).subscribe({
        next: (res: any) => {
          console.log('Fetched Data:', res);
            this.customers = res.data;
            this.totalPages = res.totalPages;
            this.loader = 'none'
        },
        error: (err: any) => {
            console.error('Error fetching customers:', err);
            this.loader = 'none'
        },
    });
  }

  tabSwitch(input: string){
    if(input === 'customer')
      this.tab = 'customer'
    else if(input === 'policy'){
      this.tab = 'policy'
    }
    else if(input === 'profile')
      this.tab = 'profile'
  }

  fetchAgentPolicies(): void {    
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);     
    this.httpService.getApiCall(`/api/v1/policy/agent`, header).subscribe({
      next: (res: any) => {
        this.agentPolices = res.data 
        
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
      this.height = this.customerPolicies.length*390+'px'      
      this.extendedCard = this.extendedCard === id ? null : id; 
  }

  forwardButton(policyId: string){
    this.httpService.patchApiCall(`/api/v1/policy/${policyId}`, {status: 'Waiting for approval'}).subscribe({
      next: (res: any) => {
        console.log(res)
        this.pendingPolicies = this.pendingPolicies.filter(policy => {
          if(policy._id === policyId)
            return false;
          return true
        })

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

  createImageFromBuffer(buffer: any): void {
    console.log(buffer);
    
  
    const base64String = this.bufferToBase64(buffer.data);
  
    // Ensure that the base64 string has the proper prefix for image type (e.g., PNG or JPEG)
    let dataUrl = 'data:image/png;base64,' + base64String; // Change 'image/png' to the correct type if needed
    
    try {
      const imageBlob = this.base64ToBlob(base64String);  // Convert the base64 part to a Blob
      const imageUrl = URL.createObjectURL(imageBlob);  // Generate an object URL for the image
      this.profilePicUrl = imageUrl;  
    } catch (error) {
      console.error('Error in createImageFromBuffer:', error);
    }
  }
  
  bufferToBase64(buffer: number[]): string {
    // Convert the buffer array (byte data) to a base64-encoded string
    const byteArray = new Uint8Array(buffer);
    
    // Process in chunks to avoid exceeding the stack size
    const chunkSize = 8192; // Adjust the chunk size if needed
    const chunks: string[] = [];
    for (let i = 0; i < byteArray.length; i += chunkSize) {
      chunks.push(String.fromCharCode(...byteArray.slice(i, i + chunkSize)));
    }
  
    return btoa(chunks.join('')); // Convert the concatenated string to Base64
  }
  
  base64ToBlob(base64: string): Blob {
    const binaryString = window.atob(base64); // Decode the base64 string
    const length = binaryString.length;
    const uintArray = new Uint8Array(length);
    
    for (let i = 0; i < length; i++) {
      uintArray[i] = binaryString.charCodeAt(i);
    }
  
    return new Blob([uintArray]);
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
