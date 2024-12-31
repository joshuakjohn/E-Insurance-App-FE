import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerpolicyComponent } from './customerpolicy.component';

describe('CustomerpolicyComponent', () => {
  let component: CustomerpolicyComponent;
  let fixture: ComponentFixture<CustomerpolicyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerpolicyComponent]
    });
    fixture = TestBed.createComponent(CustomerpolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
