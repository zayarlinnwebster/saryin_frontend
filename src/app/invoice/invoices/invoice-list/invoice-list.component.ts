import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, map, switchMap, takeUntil } from 'rxjs';
import {
  SortEvent,
  SortableDirective,
} from 'src/app/directives/sortable/sortable.directive';
import { Invoice } from 'src/app/models/invoice/invoice';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { InvoiceService } from 'src/app/services/invoice/invoice.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { InvoiceComponent } from '../../invoice/invoice.component';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css'],
  animations: [
    trigger('collapse', [
      state('open', style({ height: '*' })),
      state('closed', style({ height: '0' })),
      transition('open <=> closed', animate('300ms ease-in-out')),
    ]),
  ],
})
export class InvoiceListComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  invoices$: Observable<Invoice[]>;
  invoiceDetails$: Observable<InvoiceDetail[]>;

  total$: Observable<number>;
  totalAmount$: Observable<any>;

  detailOpenInvoiceId: number = 0;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'နယ်ပို့စာရင်းပြင်ဆင်ခြင်း။',
    hideFooter: true,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public invoiceService: InvoiceService,
    public dateRangeService: DateRangeService,
    private _modalService: NgbModal,
    private _alertModalService: AlertModalService
  ) {
    this.invoiceDetails$ = EMPTY;
    this.invoices$ = invoiceService.invoices$;
    this.total$ = invoiceService.total$;
    this.totalAmount$ = invoiceService.totalAmount$;

    invoiceService.searchList = '';

    this.dateRangeService.fromDate = invoiceService.fromDate;
    this.dateRangeService.toDate = invoiceService.toDate;

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  toggleDetails(invoiceId: number): void {
    if (this.detailOpenInvoiceId == invoiceId) {
      this.detailOpenInvoiceId = 0;
    } else {
      this.detailOpenInvoiceId = invoiceId;

      this.invoiceDetails$ = this.invoiceService
        .getInvoice(invoiceId)
        .pipe(map((invoice) => invoice.invoiceDetails));
    }
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.invoiceService.sortColumn = column;
    this.invoiceService.sortDirection = direction;
  }

  openCreateInvoice() {
    this._modalService.open(InvoiceComponent, {
      backdrop: 'static',
      fullscreen: true,
      animation: true,
    });
  }

  openEditInvoice(invoice: Invoice) {
    const modalRef = this._modalService.open(InvoiceComponent, {
      backdrop: 'static',
      fullscreen: true,
      animation: true,
    });
    modalRef.componentInstance.editInvoice = invoice;
  }

  deleteInvoice(invoiceId: number) {
    this.alertModalConfig.hideFooter = false;
    this._alertModalService.setAlertModalConfig(this.alertModalConfig);

    this._alertModalService.open(
      'ဤနယ်ပို့စာရင်းကို ဖျက်မှာသေချာပါသလား?',
      'warning'
    );
    this._alertModalService.onDismiss
      .pipe(
        takeUntil(this._alertModalService.onClose),
        switchMap((action) => {
          if (action === 'dismiss') {
            this.alertModalConfig.hideFooter = true;
            this._alertModalService.setAlertModalConfig(this.alertModalConfig);

            return this.invoiceService.deleteInvoice(invoiceId);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res) => {
          this._alertModalService.open(
            'နယ်ပို့စာရင်းဖျက်သိမ်းပြီးပါပြီ။',
            'success'
          );
        },
        error: (err) => {
          this._alertModalService.open(err, 'danger');
        },
      });
  }
}
