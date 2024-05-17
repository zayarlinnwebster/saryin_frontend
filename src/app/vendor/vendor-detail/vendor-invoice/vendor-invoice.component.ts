import { VendorDetailService } from 'src/app/services/vendor-detail/vendor-detail.service';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, switchMap, take, takeUntil } from 'rxjs';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';
import { Invoice } from 'src/app/models/invoice/invoice';
import {
  SortEvent,
  SortableDirective,
} from 'src/app/directives/sortable/sortable.directive';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { InvoiceComponent } from 'src/app/invoice/invoice/invoice.component';
import { InvoiceService } from 'src/app/services/invoice/invoice.service';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';
import { InvoiceDetailService } from 'src/app/services/invoice-detail/invoice-detail.service';
import { InvoiceDetailEditComponent } from 'src/app/invoice/invoice-detail-edit/invoice-detail-edit.component';

@Component({
  selector: 'app-vendor-invoice',
  templateUrl: './vendor-invoice.component.html',
  styleUrls: ['./vendor-invoice.component.css'],
})
export class VendorInvoiceComponent {
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
    public vendorDetailService: VendorDetailService,
    public dateRangeService: DateRangeService,
    public invoiceDetailService: InvoiceDetailService,
    private _modalService: NgbModal,
    private _alertModalService: AlertModalService,
    private _invoiceService: InvoiceService
  ) {
    this.invoiceDetails$ = vendorDetailService.vendorInvoices;
    this.total$ = vendorDetailService.invoiceTotal;
    vendorDetailService.searchList = '';

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
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

    this.vendorDetailService.sortColumn = column;
    this.vendorDetailService.sortDirection = direction;
  }

  openEditInvoiceDetail(invoiceDetail: InvoiceDetail) {
    const modalRef = this._modalService.open(InvoiceDetailEditComponent, {
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.editInvoiceDetail = invoiceDetail;

    modalRef.componentInstance.isSuccess
      .pipe(take(1))
      .subscribe(() => (this.vendorDetailService.searchList = ''));
  }

}
