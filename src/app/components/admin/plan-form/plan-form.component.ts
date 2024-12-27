import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlanDialogComponent } from '../plan-dialog/plan-dialog.component';
import { SchemeFormComponent } from '../scheme-form/scheme-form.component';

@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.component.html',
  styleUrls: ['./plan-form.component.scss']
})
export class PlanFormComponent {
  constructor(private dialog: MatDialog) {}

  openPlanDialog(): void {
    this.dialog.open(PlanDialogComponent, {
      width: '400px',
      height: 'auto',
      disableClose: true
    });
  }

  openSchemeDialog(): void {
    this.dialog.open(SchemeFormComponent, {
      width: '800px',
      height: 'auto',
      disableClose: true
    });
  }
}
