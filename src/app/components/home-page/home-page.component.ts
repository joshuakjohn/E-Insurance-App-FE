import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginAndSignupComponent } from '../login-and-signup/login-and-signup.component';
import { Router } from '@angular/router';
import { AgentRegistrationComponent } from '../login-and-signup/agent-registration/agent-registration.component';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { PROFILE_ICON } from 'src/assets/svg-icons';
import { LoginService } from 'src/app/services/data-services/login.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {

  role = localStorage.getItem('role')
  profilePhotoBuffer: string | null
  email!: string | null
  username!: string | null
  private loginTriggeredSub!: Subscription;

  constructor(public dialog: MatDialog,public router:Router, public iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer, public cdr: ChangeDetectorRef, private loginService: LoginService){
    iconRegistry.addSvgIconLiteral('profile-icon', sanitizer.bypassSecurityTrustHtml(PROFILE_ICON));
    this.profilePhotoBuffer = localStorage.getItem('profileImage');   
    this.email = localStorage.getItem('email')
    this.username = localStorage.getItem('username')
  }

  ngOnInit(): void {
    this.loginTriggeredSub = this.loginService.loginTriggered$.subscribe(() => {      
      this.loginAndSignupDialog();
    });
  }

  ngOnDestroy(): void {
    if (this.loginTriggeredSub) {
      this.loginTriggeredSub.unsubscribe();
    }
  }

  agentRegisterDialog(){
    let dialogRef = this.dialog.open(AgentRegistrationComponent, {
      height: 'auto',
      width: 'auto',
    }
  );

    dialogRef.afterClosed().subscribe(result => {
      if(result)
        this.role = result
    });
  }

  loginAndSignupDialog(){
    let dialogRef = this.dialog.open(LoginAndSignupComponent, {
      height: 'auto',
      width: 'auto',
    }
  );

    dialogRef.afterClosed().subscribe(result => {
      if(result)
        this.role = result
        this.profilePhotoBuffer = localStorage.getItem('profileImage');
        this.email = localStorage.getItem('email')
        this.username = localStorage.getItem('username')
    });
  }
  goToDashboard() {
    if(this.role === 'customer')
      this.router.navigate(['/customerdashboard/policy'])
    else if(this.role === 'agent')
      this.router.navigate(['/agent/customers'])
    else if(this.role === 'admin')
      this.router.navigate(['/admin/dashboard'])
    else if(this.role === 'employee')
      this.router.navigate(['/employee/dashboard'])
    else if(!this.role)
      this.loginAndSignupDialog()
  }

  explore(){
    window.scrollTo({
      top: 475, // scroll down 500px
      left: 0,  // keep horizontal scroll at 0
      behavior: 'smooth' // smoothly scroll to the position
    });
  }
  
  logout(): void {
    localStorage.clear()
    this.role = null
    this.profilePhotoBuffer = null
    this.email = null
    this.username = null
  }
}
