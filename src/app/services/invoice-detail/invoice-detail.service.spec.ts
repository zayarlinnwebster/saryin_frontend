import { TestBed } from '@angular/core/testing';

import { InvoiceDetailService } from './invoice-detail.service';

describe('InvoiceDetailService', () => {
  let service: InvoiceDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
