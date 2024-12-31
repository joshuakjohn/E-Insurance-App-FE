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

  constructor(public dialog: MatDialog,public router:Router){}

  loginAndSignupDialog(){
    let dialogRef = this.dialog.open(LoginAndSignupComponent, {
      height: 'auto',
      width: 'auto',
    }
  );

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  goToCustomerPolicies() {
    this.router.navigate(['/customerdashboard/policy']).then((success) => {
      if (success) {
        console.log('Navigation to customer policies was successful!');
      } else {
        console.error('Navigation to customer policies failed!');
      }
    });
  }
}
