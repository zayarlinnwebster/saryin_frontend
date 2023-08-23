import { TestBed } from '@angular/core/testing';

import { CustomerPaymentService } from './customer-payment.service';

describe('CustomerPaymentService', () => {
  let service: CustomerPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
