import { TestBed } from '@angular/core/testing';

import { StockItemOutService } from './stock-item-out.service';

describe('StockItemOutService', () => {
  let service: StockItemOutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockItemOutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
