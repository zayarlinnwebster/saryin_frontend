import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialPaymentListComponent } from './financial-payment-list.component';

describe('FinancialPaymentListComponent', () => {
  let component: FinancialPaymentListComponent;
  let fixture: ComponentFixture<FinancialPaymentListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FinancialPaymentListComponent]
    });
    fixture = TestBed.createComponent(FinancialPaymentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
