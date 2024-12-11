import { TestBed } from '@angular/core/testing';

import { FinancialCustomerPaymentService } from './financial-customer-payment.service';

describe('FinancialCustomerPaymentService', () => {
  let service: FinancialCustomerPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialCustomerPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
