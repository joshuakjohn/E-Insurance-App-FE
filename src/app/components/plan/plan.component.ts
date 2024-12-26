import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/service/http-service/http.service';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss'],
})
export class PlanComponent implements OnInit {
  plans: any[] = [];

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.fetchPlans();
  }

  fetchPlans(): void {
    this.httpService.getAllPlan('/api/v1/plan').subscribe({
      next: (res: any) => {
        if (res.code === 200) {
          this.plans = res.data.map((plan: any) => ({
            ...plan,
            imageUrl: this.getImageUrl(plan.category), // Assigning an image URL based on the category
          }));
        }
      },
      error: (err: any) => {
        console.error('Error fetching plans:', err);
      },
    });
  }

  // Helper function to assign an image URL based on the category
 // Helper function to assign an image URL based on the category
getImageUrl(category: string): string {
  switch (category) {
    case 'Health':
      return 'assets/family-figure-shape-stethoscope-with-copy-space.jpg';  
    case 'Life':
      return 'assets/life.jpeg';    // Replace with actual image URL for Life
    case 'Vehicle':
      return 'assets/vehicle.jpg'; // Replace with actual image URL for Vehicle
    default:
      return 'assets/default-image.jpg'; // Default image if no match
  }
}

}
