import { TestBed } from '@angular/core/testing';

import { MainDashboardService } from './main-dashboard.service';

describe('MainDashboardService', () => {
  let service: MainDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
