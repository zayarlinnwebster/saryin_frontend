import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import {
  SortEvent,
  SortableDirective,
} from 'src/app/directives/sortable/sortable.directive';
import { InvoiceComponent } from '../../invoice/invoice.component';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';
import { InvoiceDetailService } from 'src/app/services/invoice-detail/invoice-detail.service';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';

@Component({
  selector: 'app-invoice-detail-list',
  templateUrl: './invoice-detail-list.component.html',
  styleUrls: ['./invoice-detail-list.component.css'],
})
export class InvoiceDetailListComponent {
  faDollarSign = faDollarSign;

  limitOptions: object[] = LIMIT_OPTIONS;
  invoiceDetails$: Observable<InvoiceDetail[]>;
  total$: Observable<number>;
  totalAmount$: Observable<any>;

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public invoiceDetailService: InvoiceDetailService,
    public dateRangeService: DateRangeService,
    private _modalService: NgbModal
  ) {
    this.invoiceDetails$ = invoiceDetailService.invoiceDetails$;
    this.total$ = invoiceDetailService.total$;
    this.totalAmount$ = invoiceDetailService.totalAmount$;

    invoiceDetailService.searchList = '';

    this.dateRangeService.fromDate = invoiceDetailService.fromDate;
    this.dateRangeService.toDate = invoiceDetailService.toDate;
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.invoiceDetailService.sortColumn = column;
    this.invoiceDetailService.sortDirection = direction;
  }

  openCreateInvoice() {
    this._modalService.open(InvoiceComponent, {
      backdrop: 'static',
      fullscreen: true,
      animation: true,
    });
  }
}
