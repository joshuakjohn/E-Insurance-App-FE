import { Component, OnInit } from '@angular/core';
import { HttpService } from './service/http-service/http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'E-Insurance-App-FE';

  ngOnInit() {
  
  }
}
