import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentPolicyComponent } from './agentpolicy.component';

describe('AgentpolicyComponent', () => {
  let component: AgentPolicyComponent;
  let fixture: ComponentFixture<AgentPolicyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AgentPolicyComponent]
    });
    fixture = TestBed.createComponent(AgentPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
