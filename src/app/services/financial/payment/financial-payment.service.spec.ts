import { TestBed } from '@angular/core/testing';

import { FinancialPaymentService } from './financial-payment.service';

describe('FinancialPaymentService', () => {
  let service: FinancialPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
