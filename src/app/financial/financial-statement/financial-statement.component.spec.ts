import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialStatementComponent } from './financial-statement.component';

describe('FinancialStatementComponent', () => {
  let component: FinancialStatementComponent;
  let fixture: ComponentFixture<FinancialStatementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FinancialStatementComponent]
    });
    fixture = TestBed.createComponent(FinancialStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
