import { HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { HttpService } from 'src/app/services/http-services/http.service';
import { CustomerpolicyComponent } from './customerpolicy/customerpolicy.component';
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

  tab: string = 'customer';
  customers: any[] = [];
  pendingPolices: any[] = [];

  constructor(public iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, private httpService: HttpService, public dialog: MatDialog, public router: Router
  ){
    iconRegistry.addSvgIconLiteral('profile-icon', sanitizer.bypassSecurityTrustHtml(PROFILE_ICON));
  }

  ngOnInit(): void {
    this.fetchCustomers();
    this.fetchPendingPolicy()
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
    else if(input === 'policy')
      this.tab = 'policy'
  }

  fetchPendingPolicy(): void {    
    const header = new HttpHeaders().set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzY5NWJkOGRmMzdjZjE3ZDBjY2VhNDIiLCJlbWFpbCI6ImF2aUBnbWFpbC5jb20iLCJpYXQiOjE3MzU1NzM1MjYsImV4cCI6MTczNjE3ODMyNn0.j-dES4y5s04ZoTI-F6LuNfSpqfl8Cv-JQ9Sb3-ZkGm4`);     
    this.httpService.getApiCall(`/api/v1/policy/agent`, header).subscribe({
      next: (res: any) => {
        this.pendingPolices = res.data.filter((policy: any) => {
          if(policy.status === 'submitted')
            return true
          return false
        })
        console
      },
      error: (err: any) => {
        console.error('Error fetching plans:', err);
      },
    });
  }

  viewCustomerPolicies(customerId: string){
    

    let dialogRef = this.dialog.open(CustomerpolicyComponent, {
      height: '600px',
      width: '1000px',
      data: {customerId}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });

  }

  forwardButton(policyId: string){
    this.httpService.patchApiCall(`/api/v1/policy/${policyId}`).subscribe({
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

}
