import { HttpHeaders } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http-services/http.service';

@Component({
  selector: 'app-customerpolicy',
  templateUrl: './customerpolicy.component.html',
  styleUrls: ['./customerpolicy.component.scss']
})
export class CustomerpolicyComponent {

  policies: any[] = []

  constructor(private httpService: HttpService,
    public dialogRef: MatDialogRef<CustomerpolicyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ){

  }

  ngOnInit(){
    console.log(this.data.customerId)
    const header = new HttpHeaders().set('Authorization', `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzY5NWJkOGRmMzdjZjE3ZDBjY2VhNDIiLCJlbWFpbCI6ImF2aUBnbWFpbC5jb20iLCJpYXQiOjE3MzU1NzM1MjYsImV4cCI6MTczNjE3ODMyNn0.j-dES4y5s04ZoTI-F6LuNfSpqfl8Cv-JQ9Sb3-ZkGm4`);     
    this.httpService.getApiCall(`/api/v1/policy/${this.data.customerId}/getall/agent`, header).subscribe({
      next: (res: any) => {
         this.policies = res.data.filter((policy: any) => {
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

}
