import { TestBed } from '@angular/core/testing';

import { FinancialInvoiceDetailService } from './financial-invoice-detail.service';

describe('FinancialInvoiceDetailService', () => {
  let service: FinancialInvoiceDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialInvoiceDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
