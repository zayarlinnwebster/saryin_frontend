import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancialRoutingModule } from './financial-routing.module';
import { FinancialStatementListComponent } from './financial-statement-list/financial-statement-list.component';
import { FinancialStatementComponent } from './financial-statement/financial-statement.component';
import { SharedModule } from '../shared/shared.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FinancialInvoiceListComponent } from './financial-statement/financial-invoice-list/financial-invoice-list.component';
import { FinancialPaymentListComponent } from './financial-statement/financial-payment-list/financial-payment-list.component';
import { FinancialStatementDetailComponent } from './financial-statement-detail/financial-statement-detail.component';
import { InvoiceDetailTableComponent } from './financial-statement-detail/invoice-detail-table/invoice-detail-table.component';
import { CustomerPaymentTableComponent } from './financial-statement-detail/customer-payment-table/customer-payment-table.component';


@NgModule({
  declarations: [
    FinancialStatementListComponent,
    FinancialStatementComponent,
    FinancialInvoiceListComponent,
    FinancialPaymentListComponent,
    FinancialStatementDetailComponent,
    InvoiceDetailTableComponent,
    CustomerPaymentTableComponent,
  ],
  imports: [
    CommonModule,
    FinancialRoutingModule,
    SharedModule,
    NgbNavModule
  ]
})
export class FinancialModule { }
