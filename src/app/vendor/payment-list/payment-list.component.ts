import { Component, QueryList, ViewChildren } from '@angular/core';
import { PaymentComponent } from '../payment/payment.component';
import { VendorPayment } from 'src/app/models/vendor/vendor-payment';
import {
  SortEvent,
  SortableDirective,
} from 'src/app/directives/sortable/sortable.directive';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { EMPTY, Observable, switchMap, takeUntil } from 'rxjs';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { VendorPaymentService } from 'src/app/services/vendor-payment/vendor-payment.service';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css'],
})
export class PaymentListComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  vendorPayments$: Observable<VendorPayment[]>;
  total$: Observable<number>;
  totalAmount$: Observable<any>;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ပွဲရုံလွှဲငွေပြင်ဆင်ခြင်း။',
    hideFooter: false,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public vendorPaymentService: VendorPaymentService,
    public dateRangeService: DateRangeService,
    private _modalService: NgbModal,
    private _alertModalService: AlertModalService
  ) {
    this.vendorPayments$ = vendorPaymentService.vendorPayments$;
    this.total$ = vendorPaymentService.total$;
    this.totalAmount$ = vendorPaymentService.totalAmount$;

    vendorPaymentService.searchList = '';

    this.dateRangeService.fromDate = vendorPaymentService.fromDate;
    this.dateRangeService.toDate = vendorPaymentService.toDate;

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.vendorPaymentService.sortColumn = column;
    this.vendorPaymentService.sortDirection = direction;
  }

  onDateSelection(date: NgbDate) {
    if (!this.dateRangeService.fromDate && !this.dateRangeService.toDate) {
      this.dateRangeService.fromDate = date;

      this.vendorPaymentService.fromDate = this.dateRangeService.fromDate;
    } else if (
      this.dateRangeService.fromDate &&
      !this.dateRangeService.toDate &&
      date &&
      date.after(this.dateRangeService.fromDate)
    ) {
      this.dateRangeService.toDate = date;

      this.vendorPaymentService.toDate = this.dateRangeService.toDate;
    } else {
      this.dateRangeService.toDate = null;
      this.dateRangeService.fromDate = date;

      this.vendorPaymentService.fromDate = this.dateRangeService.fromDate;
      this.vendorPaymentService.toDate = null;
    }
  }

  openCreateVendorPayment() {
    this._modalService.open(PaymentComponent, {
      backdrop: 'static',
      animation: true,
    });
  }

  openEditVendorPayment(vendorPayment: VendorPayment) {
    const modalRef = this._modalService.open(PaymentComponent, {
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.editVendorPayment = vendorPayment;
  }

  deleteVendorPayment(vendorPaymentId: number) {
    this.alertModalConfig.hideFooter = false;
    this._alertModalService.setAlertModalConfig(this.alertModalConfig);

    this._alertModalService.open(
      'ဤပွဲရုံလွှဲငွေကို ဖျက်မှာသေချာပါသလား?',
      'warning'
    );
    this._alertModalService.onDismiss
      .pipe(
        takeUntil(this._alertModalService.onClose),
        switchMap((action) => {
          if (action === 'dismiss') {
            this.alertModalConfig.hideFooter = true;
            this._alertModalService.setAlertModalConfig(this.alertModalConfig);

            return this.vendorPaymentService.deleteVendorPayment(
              vendorPaymentId
            );
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res) => {
          this._alertModalService.open(
            'ပွဲရုံလွှဲငွေဖျက်သိမ်းပြီးပါပြီ။',
            'success'
          );
        },
        error: (err) => {
          this._alertModalService.open(err, 'danger');
        },
      });
  }
}
