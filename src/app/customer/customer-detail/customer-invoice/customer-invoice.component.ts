import {
  Component,
  EventEmitter,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, take } from 'rxjs';
import {
  SortEvent,
  SortableDirective,
} from 'src/app/directives/sortable/sortable.directive';
import { InvoiceDetailEditComponent } from 'src/app/invoice/invoice-detail-edit/invoice-detail-edit.component';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { CustomerDetailService } from 'src/app/services/customer-detail/customer-detail.service';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';

@Component({
  selector: 'app-customer-invoice',
  templateUrl: './customer-invoice.component.html',
  styleUrls: ['./customer-invoice.component.css'],
})
export class CustomerInvoiceComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  invoiceDetails$: Observable<InvoiceDetail[]>;
  total$: Observable<number>;
  isDetailsOpen: boolean[] = [];

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'နယ်ပို့စာရင်းပြင်ဆင်ခြင်း။',
    hideFooter: true,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public customerDetailService: CustomerDetailService,
    public dateRangeService: DateRangeService,
    private _modalService: NgbModal,
    private _alertModalService: AlertModalService
  ) {
    this.invoiceDetails$ = customerDetailService.customerInvoiceDetails;
    this.total$ = customerDetailService.invoiceTotal;
    customerDetailService.searchList = '';

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  openEditInvoiceDetail(invoiceDetail: InvoiceDetail) {
    const modalRef = this._modalService.open(InvoiceDetailEditComponent, {
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.editInvoiceDetail = invoiceDetail;

    modalRef.componentInstance.isSuccess
      .pipe(take(1))
      .subscribe(() => (this.customerDetailService.searchList = ''));
  }

  toggleDetails(index: number): void {
    this.isDetailsOpen[index] = !this.isDetailsOpen[index];
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.customerDetailService.sortColumn = column;
    this.customerDetailService.sortDirection = direction;
  }
}
