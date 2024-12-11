import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPaymentTableComponent } from './customer-payment-table.component';

describe('CustomerPaymentTableComponent', () => {
  let component: CustomerPaymentTableComponent;
  let fixture: ComponentFixture<CustomerPaymentTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerPaymentTableComponent]
    });
    fixture = TestBed.createComponent(CustomerPaymentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
