import { TestBed } from '@angular/core/testing';

import { StoreDetailService } from './store-detail.service';

describe('StoreDetailService', () => {
  let service: StoreDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
