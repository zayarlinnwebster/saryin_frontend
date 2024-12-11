import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialInvoiceListComponent } from './financial-invoice-list.component';

describe('FinancialInvoiceListComponent', () => {
  let component: FinancialInvoiceListComponent;
  let fixture: ComponentFixture<FinancialInvoiceListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FinancialInvoiceListComponent]
    });
    fixture = TestBed.createComponent(FinancialInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
