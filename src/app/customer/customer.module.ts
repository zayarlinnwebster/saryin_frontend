import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerComponent } from './customer/customer.component';
import { SharedModule } from '../shared/shared.module';
import { PaymentListComponent } from './payment-list/payment-list.component';
import { PaymentComponent } from './payment/payment.component';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';
import { CustomerInvoiceComponent } from './customer-detail/customer-invoice/customer-invoice.component';
import { CustomerPaymentComponent } from './customer-detail/customer-payment/customer-payment.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [CustomerListComponent, CustomerComponent, PaymentListComponent, PaymentComponent, CustomerDetailComponent, CustomerInvoiceComponent, CustomerPaymentComponent],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    SharedModule,
    NgbNavModule
  ],
})
export class CustomerModule {}
