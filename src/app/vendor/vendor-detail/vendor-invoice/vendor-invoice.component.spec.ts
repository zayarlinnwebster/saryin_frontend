import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorInvoiceComponent } from './vendor-invoice.component';

describe('VendorInvoiceComponent', () => {
  let component: VendorInvoiceComponent;
  let fixture: ComponentFixture<VendorInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VendorInvoiceComponent]
    });
    fixture = TestBed.createComponent(VendorInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
