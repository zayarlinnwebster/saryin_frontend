import { TestBed } from '@angular/core/testing';

import { VendorDetailService } from './vendor-detail.service';

describe('VendorDetailService', () => {
  let service: VendorDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VendorDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
