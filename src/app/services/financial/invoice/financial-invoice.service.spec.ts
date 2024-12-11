import { TestBed } from '@angular/core/testing';

import { FinancialInvoiceService } from './financial-invoice.service';

describe('FinancialInvoiceService', () => {
  let service: FinancialInvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialInvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
