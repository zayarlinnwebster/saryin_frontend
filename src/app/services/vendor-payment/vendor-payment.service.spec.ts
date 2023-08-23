import { TestBed } from '@angular/core/testing';

import { VendorPaymentService } from './vendor-payment.service';

describe('VendorPaymentService', () => {
  let service: VendorPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VendorPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
