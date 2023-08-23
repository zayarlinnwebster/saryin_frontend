import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceListComponent } from './invoices/invoice-list/invoice-list.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { SharedModule } from '../shared/shared.module';
import { InvoiceDetailComponent } from './invoice/invoice-detail/invoice-detail.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { InvoiceDetailListComponent } from './invoices/invoice-detail-list/invoice-detail-list.component';


@NgModule({
  declarations: [
    InvoiceListComponent,
    InvoiceComponent,
    InvoiceDetailComponent,
    InvoicesComponent,
    InvoiceDetailListComponent
  ],
  imports: [
    CommonModule,
    InvoiceRoutingModule,
    SharedModule,
    NgbNavModule
  ]
})
export class InvoiceModule { }
