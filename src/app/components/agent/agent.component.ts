import { HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { HttpService } from 'src/app/services/http-services/http.service';

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})
export class AgentComponent {

  customers: any[] = [];

  constructor(private httpService: HttpService){

  }

  ngOnInit(): void {
    this.fetchCustomers();
  }

  fetchCustomers(): void {
    const header = new HttpHeaders().set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzY5NWJkOGRmMzdjZjE3ZDBjY2VhNDIiLCJlbWFpbCI6ImF2aUBnbWFpbC5jb20iLCJpYXQiOjE3MzQ5NTgxMDYsImV4cCI6MTczNTU2MjkwNn0.kvleoCg1BmhnsXE5yepkOVlNJlqJSu5JBrl5sZ80nO8`);
    this.httpService.getApiCall('/api/v1/customer', header).subscribe({
      next: (res: any) => {
        this.customers = res.data
      },
      error: (err: any) => {
        console.error('Error fetching plans:', err);
      },
    });
  }

}
