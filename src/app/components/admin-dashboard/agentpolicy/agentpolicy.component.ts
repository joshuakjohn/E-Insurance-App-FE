import { HttpHeaders } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http-services/http.service';

@Component({
  selector: 'app-agent-policy',
  templateUrl: './agentpolicy.component.html',
  styleUrls: ['./agentpolicy.component.scss']
})
export class AgentPolicyComponent {

  policies: any[] = [];

  constructor(
    private httpService: HttpService,
    public dialogRef: MatDialogRef<AgentPolicyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    console.log(this.data.agentId);
    const header = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('authToken') || ''}`);
    this.httpService.getApiCall(`/api/v1/policy/${this.data.agentId}`, header).subscribe({
      next: (res: any) => {
        console.log('Policies fetched:', res.data);
        this.policies = res.data;
      },
      error: (err: any) => {
        console.error('Error fetching policies:', err);
      },
    });
  }

}