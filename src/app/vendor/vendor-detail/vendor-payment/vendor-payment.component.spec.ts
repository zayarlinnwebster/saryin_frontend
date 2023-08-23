import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorPaymentComponent } from './vendor-payment.component';

describe('VendorPaymentComponent', () => {
  let component: VendorPaymentComponent;
  let fixture: ComponentFixture<VendorPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VendorPaymentComponent]
    });
    fixture = TestBed.createComponent(VendorPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
