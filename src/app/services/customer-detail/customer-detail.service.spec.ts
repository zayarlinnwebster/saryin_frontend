import { TestBed } from '@angular/core/testing';

import { CustomerDetailService } from './customer-detail.service';

describe('CustomerDetailService', () => {
  let service: CustomerDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
