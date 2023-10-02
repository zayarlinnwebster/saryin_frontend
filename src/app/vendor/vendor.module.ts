import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorRoutingModule } from './vendor-routing.module';
import { VendorListComponent } from './vendor-list/vendor-list.component';
import { VendorComponent } from './vendor/vendor.component';
import { SharedModule } from '../shared/shared.module';
import { PaymentComponent } from './payment/payment.component';
import { PaymentListComponent } from './payment-list/payment-list.component';
import { VendorDetailComponent } from './vendor-detail/vendor-detail.component';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { VendorPaymentComponent } from './vendor-detail/vendor-payment/vendor-payment.component';
import { VendorInvoiceComponent } from './vendor-detail/vendor-invoice/vendor-invoice.component';

@NgModule({
  declarations: [VendorListComponent, VendorComponent, PaymentComponent, PaymentListComponent, VendorDetailComponent, VendorPaymentComponent, VendorInvoiceComponent],
  imports: [
    CommonModule,
    VendorRoutingModule,
    SharedModule,
    NgbNavModule,
    NgbPopoverModule
  ],
})
export class VendorModule {}
