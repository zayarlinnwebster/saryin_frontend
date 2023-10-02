import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceListComponent } from './invoices/invoice-list/invoice-list.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { SharedModule } from '../shared/shared.module';
import { InvoiceDetailComponent } from './invoice/invoice-detail/invoice-detail.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { InvoiceDetailListComponent } from './invoices/invoice-detail-list/invoice-detail-list.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


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
    NgbNavModule,
    FontAwesomeModule,
    NgbPopoverModule
  ]
})
export class InvoiceModule { }
