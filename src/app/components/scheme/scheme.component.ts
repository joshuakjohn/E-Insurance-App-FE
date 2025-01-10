import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/services/http-services/http.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginAndSignupComponent } from '../login-and-signup/login-and-signup.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { DROPDOWN_ICON } from 'src/assets/svg-icons';
import { PolicyComponent } from '../policy/policy.component';
import { HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-scheme',
  templateUrl: './scheme.component.html',
  styleUrls: ['./scheme.component.scss']
})
export class SchemeComponent implements OnInit {
  extend: string = 'none';
  schemes: any[] = [];
  planId: string | null = null;
  planDetails: any = {}; 
  isOverlayVisible: boolean = false;
  selectedScheme: any = {};
  selectedSchemeId: string | null = null;  // To store the schemeId temporarily for after login
  searchQuery: string = ''; 
  isLoading: boolean = false;
  currentPage: number = 1; 
  itemsPerPage: number = 10; 
  totalResults: number = 0;
  policyApplication: boolean = false;
  height: string = '190px';
  totalPages!: number;
  private searchSubject: Subject<string> = new Subject<string>();
  sortOrder: 'asc' | 'desc' = 'asc'; // Default sort order

  constructor(
    public iconRegistry: MatIconRegistry, 
    private sanitizer: DomSanitizer,
    private httpService: HttpService,
    public router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {
    iconRegistry.addSvgIconLiteral('dropdown-icon', sanitizer.bypassSecurityTrustHtml(DROPDOWN_ICON));
  }

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
    this.searchSubject.pipe(debounceTime(300)).subscribe(query => {
      this.performSearch(query);
    });
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      window.scrollTo({
        top: 475,
        left: 0,
        behavior: 'smooth'
      });
    }, 50);
  }

  fetchPlanDetails(): void {
    if (this.planId) {
      this.httpService.getApiCall(`/api/v1/plan/${this.planId}`).subscribe({
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

  fetchSchemes(): void {
    if (this.planId) {
      const params = {
        page: this.currentPage.toString(),
        limit: this.itemsPerPage.toString(),
      };

      this.httpService.getApiCall(`/api/v1/scheme/${this.planId}/getall`).subscribe({
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
      return 'assets/images/default-scheme.jpg'; 
    }

    const lowerCaseCategory = this.planDetails.category.toLowerCase();
    switch (lowerCaseCategory) {
      case 'health':
        return 'assets/health_scheme.png';
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
  buyScheme(scheme: any): void { 
    this.selectedScheme = scheme;         
    if(localStorage.getItem('role') === 'customer'){
      this.policyApplication = true
      this.height = 1150+'px'
    } else {
      this.openLoginDialog();
    }
  }

  navigateToPolicy(schemeId: string): void {
    if (this.isLoggedIn()) {
      // If user is logged in, navigate to policy page
      if (schemeId) {
        this.router.navigate([`/dashboard/plans/${this.planId}/scheme/${schemeId}/policy`]);
      } else {
        console.error('Scheme ID is missing.');
      }
    } else {
      // If user is not logged in, store the selected scheme ID and open the login/signup dialog
      this.selectedSchemeId = schemeId;
      console.log(this.selectedSchemeId)
    }
  }

  closeOverlay(): void {
    this.isOverlayVisible = false;
  }

  isLoggedIn(): boolean {
    // Check if the user is logged in by looking for a valid token
    const token = localStorage.getItem('authToken');
    return token ? true : false;
  }

  // Open login/signup dialog
  openLoginDialog(): void {
    const currentUrl = this.router.url;
  localStorage.setItem('redirectUrl', currentUrl);
    const dialogRef = this.dialog.open(LoginAndSignupComponent, {
      height: 'auto',
      width: 'auto',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (localStorage.getItem('role') === 'customer') {
        this.policyApplication = true
        this.height = 1150+'px'
        // this.router.navigate([`/dashboard/plans/${this.planId}/scheme/${this.selectedSchemeId}/policy`]);
      } else {
        console.log('User did not log in');
      }
    });
  }

  extendedCard: number | null = null;

  extendToggle(id: number): void {
    this.applicationToggle('close')
    this.extendedCard = this.extendedCard === id ? null : id;
  }

  policyDialog(): void {
    const dialogRef = this.dialog.open(PolicyComponent, {
      height: '600px',
      width: '1200px',
      data: {planId: this.planId, schemeId: this.selectedSchemeId}
    });

    dialogRef.afterClosed().subscribe(result => {
      // if (localStorage.getItem('role') === 'customer') {
      //   this.router.navigate([`/dashboard/plans/${this.planId}/scheme/${this.selectedSchemeId}/policy`]);
      // } else {
      //   console.log('User did not log in');
      // }
    });
  }


  onSearchChange(): void {
    const query = this.searchQuery.trim();
    if (query) {
        this.searchSubject.next(query); 
    }
}
  onSearchBlur(): void {
    const query = this.searchQuery.trim();
    if (query) {
      this.performSearch(query); 
    }
  }
  private performSearch(query: string): void {
    this.isLoading = true;
    const params = {
        search: query,
        page: this.currentPage.toString(),
        limit: this.itemsPerPage.toString(),
        sortOrder: this.sortOrder 
    };
    this.httpService.getSearchScheme('/api/v1/scheme/search', { params }).subscribe({
        next: (res: any) => {
            this.schemes = res.data.results || [];
            this.totalResults = res.total || 0;
            this.isLoading = false;
        },
        error: (err: any) => {
            console.error('Error fetching schemes:', err);
            this.schemes = [];
            this.isLoading = false;
        }
    });
}

filter(sortOrder: 'asc' | 'desc' = 'asc') {
  if (this.sortOrder === sortOrder) {
      return; 
  }
  this.isLoading = true;
  this.sortOrder = sortOrder; 
  const query = this.searchQuery.trim();
  if (query) {
      this.performSearch(query); 
  } else {
      this.httpService.getApiCall(`/api/v1/scheme/filter?sortOrder=${sortOrder}`).subscribe({
          next: (res: any) => {
              if (res.code === 200) {
                  this.schemes = res.data || [];
                  this.totalResults = res.total || 0;
                  this.currentPage = res.page || 1;
                  this.totalPages = res.totalPages || 1;
              } else {
                  console.warn('Unexpected response:', res);
                  this.schemes = [];
              }

              this.isLoading = false;
          },
          error: (err: any) => {
              console.error('Error fetching filtered schemes:', err);
              this.schemes = [];
              this.isLoading = false;
          }
      });
  }
}
  applicationToggle(event: string){
    if(event === 'close'){
      this.policyApplication = false
      this.height = '190px'
    }

  }

}
