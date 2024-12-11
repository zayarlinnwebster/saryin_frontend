import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDetailTableComponent } from './invoice-detail-table.component';

describe('InvoiceDetailTableComponent', () => {
  let component: InvoiceDetailTableComponent;
  let fixture: ComponentFixture<InvoiceDetailTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvoiceDetailTableComponent]
    });
    fixture = TestBed.createComponent(InvoiceDetailTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
