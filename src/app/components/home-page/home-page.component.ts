import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginAndSignupComponent } from '../login-and-signup/login-and-signup.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {

  role = localStorage.getItem('role')

  constructor(public dialog: MatDialog,public router:Router){}

  loginAndSignupDialog(){
    let dialogRef = this.dialog.open(LoginAndSignupComponent, {
      height: 'auto',
      width: 'auto',
    }
  );

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if(result)
        this.role = result
    });
  }
  goToDashboard() {
    if(this.role === 'customer')
      this.router.navigate(['/customerdashboard/policy'])
    else if(this.role === 'agent')
      this.router.navigate(['/agent'])
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
  
}
