import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerUsageDetailComponent } from './customer-usage-detail.component';

describe('CustomerUsageDetailComponent', () => {
  let component: CustomerUsageDetailComponent;
  let fixture: ComponentFixture<CustomerUsageDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomerUsageDetailComponent]
    });
    fixture = TestBed.createComponent(CustomerUsageDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
