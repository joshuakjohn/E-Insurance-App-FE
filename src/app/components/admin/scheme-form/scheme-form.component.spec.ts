import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeFormComponent } from './scheme-form.component';

describe('SchemeFormComponent', () => {
  let component: SchemeFormComponent;
  let fixture: ComponentFixture<SchemeFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeFormComponent]
    });
    fixture = TestBed.createComponent(SchemeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
