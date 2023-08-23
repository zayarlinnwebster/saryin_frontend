import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPaymentComponent } from './customer-payment.component';

describe('CustomerPaymentComponent', () => {
  let component: CustomerPaymentComponent;
  let fixture: ComponentFixture<CustomerPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerPaymentComponent]
    });
    fixture = TestBed.createComponent(CustomerPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
