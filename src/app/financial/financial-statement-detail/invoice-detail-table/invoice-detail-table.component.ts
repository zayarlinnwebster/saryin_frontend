import { Component, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { SortableDirective, SortEvent } from 'src/app/directives/sortable/sortable.directive';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';
import { FinancialInvoiceDetailService } from 'src/app/services/financial/invoice/financial-invoice-detail.service';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';

@Component({
  selector: 'app-invoice-detail-table',
  templateUrl: './invoice-detail-table.component.html',
  styleUrls: ['./invoice-detail-table.component.css']
})
export class InvoiceDetailTableComponent {
  financialInvoiceList$: Observable<InvoiceDetail[]>;
  total$: Observable<number>;
  limitOptions: object[] = LIMIT_OPTIONS;

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public financialInvoiceDetailService: FinancialInvoiceDetailService,
  ) {

    this.financialInvoiceList$ = this.financialInvoiceDetailService.invoiceDetails$;
    this.total$ = financialInvoiceDetailService.total$;
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.financialInvoiceDetailService.sortColumn = column;
    this.financialInvoiceDetailService.sortDirection = direction;
  }
}
