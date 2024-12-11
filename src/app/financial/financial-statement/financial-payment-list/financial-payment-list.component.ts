import { Component, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { SortableDirective, SortEvent } from 'src/app/directives/sortable/sortable.directive';
import { CustomerPayment } from 'src/app/models/customer/customer-payment';
import { FinancialPaymentService } from 'src/app/services/financial/payment/financial-payment.service';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';

@Component({
  selector: 'app-financial-payment-list',
  templateUrl: './financial-payment-list.component.html',
  styleUrls: ['./financial-payment-list.component.css']
})
export class FinancialPaymentListComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  customerPayments$: Observable<CustomerPayment[]>;
  total$: Observable<number>;


  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public financialPaymentService: FinancialPaymentService,
  ) {
    this.customerPayments$ = financialPaymentService.customerPayments$;
    this.total$ = financialPaymentService.total$;
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.financialPaymentService.sortColumn = column;
    this.financialPaymentService.sortDirection = direction;
  }
}
