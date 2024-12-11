import { Component, QueryList, ViewChildren } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SortableDirective, SortEvent } from 'src/app/directives/sortable/sortable.directive';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';
import { FinancialInvoiceService } from 'src/app/services/financial/invoice/financial-invoice.service';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';

@Component({
  selector: 'app-financial-invoice-list',
  templateUrl: './financial-invoice-list.component.html',
  styleUrls: ['./financial-invoice-list.component.css']
})
export class FinancialInvoiceListComponent {
  destroy$: Subject<void> = new Subject<void>();
  total$: Observable<number>;

  detailOpenInvoiceId: number = 0;

  limitOptions: object[] = LIMIT_OPTIONS;
  invoiceDetails$: Observable<InvoiceDetail[]>;

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public financialInvoiceService: FinancialInvoiceService,
  ) {
    this.invoiceDetails$ = financialInvoiceService.invoiceDetails$;
    this.total$ = financialInvoiceService.total$;
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.financialInvoiceService.sortColumn = column;
    this.financialInvoiceService.sortDirection = direction;
  }

}
