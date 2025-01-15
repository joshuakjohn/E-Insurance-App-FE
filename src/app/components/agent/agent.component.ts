import { HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { HttpService } from 'src/app/services/http-services/http.service';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PROFILE_ICON } from 'src/assets/svg-icons';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})
export class AgentComponent {

  extendedCard: number | null = null;
  tab: string = '';
  customers: any[] = [];
  agentPolices: any[] = [];
  customerPolicies: any[] = [];
  pendingPolicies: any[] = []
  height: string = ''
  email: string | null
  username: string | null
  agent: any
  profilePicUrl: string = '';
  isEditing: boolean = false;
  currentPage: number = 1;
  pendingCurrentPage: number = 1;
  totalPages: number = 1;
  pendingTotalPages: number = 1;
  limit: number = 3;
  customerLoader:string = 'flex' 
  pendingPoliciesLoader = 'flex'
  originalAgentData: any;
  viewPolicies = 'View Policies'

  constructor(public iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, 
    private httpService: HttpService, public dialog: MatDialog, public router: Router, private cdr: ChangeDetectorRef){
    iconRegistry.addSvgIconLiteral('profile-icon', sanitizer.bypassSecurityTrustHtml(PROFILE_ICON));
    this.email = localStorage.getItem('email')
    this.username = localStorage.getItem('username')
  }

  ngOnInit(): void {
    this.updateActiveTab(this.router.url)
    this.fetchCustomers();
    this.fetchAgentPolicies()
    this.fetchAgentById()       
  }

  private updateActiveTab(url: string): void {    
    if (url.includes('/agent/customers')) {
      this.tab = 'customer';
    } else if (url.includes('/agent/pendingPolicies')) {
      this.tab = 'policy';
    } else if (url.includes('/agent/profile')) {
      this.tab = 'profile';
    }    
  }

  fetchAgentById(): void{
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);
    this.httpService.getApiCall('/api/v1/agent/get-agent', header).subscribe({
      next: (res: any) => {
        this.agent = res.data
        this.originalAgentData={...res.data};
        if(res.data.profilephoto !== null)
        this.profilePicUrl = this.createImageFromBuffer(res.data.profilePhoto);
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
            this.customers = res.data;
            this.customers.map(customer => {
              if(customer.profilePhoto !== null)              
                customer.profilePhoto = this.createImageFromBuffer(customer.profilePhoto)
            })
            this.totalPages = res.totalPages;
            this.customerLoader = 'none'
        },
        error: (err: any) => {
            console.error('Error fetching customers:', err);
            this.customerLoader = 'none'
        },
    });
  }

  tabSwitch(input: string){
    if(input === 'customer'){
      this.router.navigate(['/agent/customers'])

      this.tab = 'customer'
      return
    }
    else if(input === 'policy'){
      this.router.navigate(['/agent/pendingPolicies'])      
      this.tab = 'policy'
      return
    }
    else if(input === 'profile')
      this.router.navigate(['/agent/profile'])    
      this.tab = 'profile'
  }

  fetchAgentPolicies(): void {    
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);  
    const params = { page: this.pendingCurrentPage.toString(), limit: this.limit.toString() };
   
    this.httpService.getApiCall(`/api/v1/policy/agent`, header, params).subscribe({
      next: (res: any) => {
        this.pendingPolicies = res.data 
        this.pendingTotalPages = res.totalPages;
        this.pendingPolicies.map(policy => {
          const customer = this.customers.find(customer => {
            return customer._id === policy.customerId
          })
          policy.customerName = customer.username
          policy.customerEmail = customer.email
        })
        
        this.pendingPoliciesLoader = 'none'
      },
      error: (err: any) => {
        console.error('Error fetching plans:', err);
        this.pendingPoliciesLoader = 'none'
      },
    });
  }

  async viewCustomerPolicies(id: number){
    if(this.extendedCard !== id){
      try {
        const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken')}`);  
        const response: any = await lastValueFrom(
          this.httpService.getApiCall(`/api/v1/policy/${id}/getall/agent`, header)
        );
        this.customerPolicies = response.data;
        this.height = this.customerPolicies.length*340+'px' 
        this.viewPolicies = 'View less'
      } catch (error) {
        this.customerPolicies = []
        this.height = 50+'px'
        this.viewPolicies = 'View less'
        console.error('Error fetching plans:', error);
      }
    }
    if(this.extendedCard !== null)
      this.viewPolicies = 'View policies'     
    this.extendedCard = this.extendedCard === id ? null : id; 
  }

  forwardButton(policyId: string){
    this.httpService.patchApiCall(`/api/v1/policy/${policyId}`, {status: 'Waiting for approval'}).subscribe({
      next: (res: any) => {
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

  createImageFromBuffer(buffer: any): any {
  
    const base64String = this.bufferToBase64(buffer.data);
  
    try {
      const imageBlob = this.base64ToBlob(base64String);  // Convert the base64 part to a Blob
      const imageUrl = URL.createObjectURL(imageBlob);  // Generate an object URL for the image
      return imageUrl
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

  prevPage2(): void {
    if (this.pendingCurrentPage > 1) {
        this.pendingCurrentPage--;
        this.fetchAgentPolicies();
    }
  }

  nextPage2(): void {
    if (this.pendingCurrentPage < this.totalPages) {
        this.pendingCurrentPage++;
        this.fetchAgentPolicies();
    }
  }
  toggleEditMode():void{
    if(!this.isEditing){
      this.agent={...this.originalAgentData};
    }else{
      this.agent={...this.originalAgentData};
    }
    this.isEditing=!this.isEditing
  }
  saveChanges():void{
    this.originalAgentData={...this.agent};
    this.isEditing = false;
  }
}
