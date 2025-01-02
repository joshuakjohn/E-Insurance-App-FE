import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/service/http-service/http.service';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss'],
})
export class PlanComponent implements OnInit {
  plans: any[] = [];
  role: any;

  constructor(private httpService: HttpService,public router:Router,private route:ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      this.role = params.get('role');
      console.log(this.role)
    });
  }

  ngOnInit(): void {
    this.fetchPlans();
  }

  fetchPlans(): void {
    this.httpService.getAllPlan('/api/v1/plan').subscribe({
      next: (res: any) => {
        this.plans = res.data
        this.plans.map((plan: any) => {
          const title = plan.planName.replaceAll(' ', '-')
          plan.backgroundImage = `../../../assets/${title}.jpg`
        }
        )
      },
      error: (err: any) => {
        console.error('Error fetching plans:', err);
      },
    });
  }

viewScheme(planId: string) {
  if (!planId) {
    console.error('Invalid planId:', planId);
    return;
  } else if(this.role === 'admin') {
  this.router.navigate([`/admin/dashboard/plans/${planId}/scheme`]);
  } else if(this.role === 'customer') {
    this.router.navigate([`/dashboard/plans/${planId}/scheme`]);
  }
}


}



