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

  policies: any[] = []

  constructor(
    private httpService: HttpService,
    public dialogRef: MatDialogRef<AgentPolicyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    console.log(this.data.agentId);
    const header = new HttpHeaders().set('Authorization', `Bearer ${this.getToken()}`);
    this.httpService.getApiCall(`/api/v1/policy/${this.data.agentId}/getall/admin`, header).subscribe({
      next: (res: any) => {
        this.policies = res.data;
      },
      error: (err: any) => {
        console.error('Error fetching policies:', err);
      },
    });
  }

  private getToken(): string {
    // Implement your token retrieval logic here
    return 'your-admin-token-here';
  }
}