import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/service/http-service/http.service';

@Component({
  selector: 'app-scheme',
  templateUrl: './scheme.component.html',
  styleUrls: ['./scheme.component.scss']
})
export class SchemeComponent implements OnInit {
  schemes: any[] = [];
  planId: string | null = null;
  planDetails: any = {}; 
  // Pass the plan category

  constructor(
    private httpService: HttpService,
    public router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.planId = params.get('planId');
      if (this.planId) {
        this.fetchPlanDetails();
        this.fetchSchemes();
      } else {
        console.error('Plan ID is missing.');
      }
    });
  }
  fetchPlanDetails(): void {
    if (this.planId) {
      this.httpService.getPlanById(`/api/v1/plan/${this.planId}`).subscribe({
        next: (res: any) => {
          if (res.code === 200) {
            this.planDetails = res.plan;
          } 
        },
        error: (err: any) => {
          console.error('Error fetching plan details:', err);
        },
      });
    }
  }
  
  fetchSchemes() {
    if (this.planId) {
      this.httpService.getAllScheme(`/api/v1/scheme/${this.planId}/getall`).subscribe({
        next: (res: any) => {
          if (res.code === 200) {
            this.schemes = res.data;
          }
        },
        error: (err: any) => {
          console.error('Error fetching schemes:', err);
        },
      });
    } 
  }
  
  
  
  getPlanImage(): string {

    if (!this.planDetails.category) {
      return 'assets/images/default-scheme.jpg'; // Default image
    }

    const lowerCaseCategory = this.planDetails.category.toLowerCase(); // Normalize the category
    switch (lowerCaseCategory) {
      case 'health':
        return 'assets/health_scheme.jpeg';
      case 'life':
        return 'assets/images/life_scheme.jpeg';
      case 'vehicle':
        return 'assets/images/vehicle_scheme.jpeg';
      case 'travel':
        return 'assets/images/travel_scheme.jpeg';
      default:
        return 'assets/images/default-scheme.jpg';
    }
  }
}
