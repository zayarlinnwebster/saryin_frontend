import { LIMIT_OPTIONS } from './../../shared/constants';
import { DateRangeService } from './../../services/date-range/date-range.service';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgbDate, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, switchMap, takeUntil } from 'rxjs';
import {
  SortEvent,
  SortableDirective,
} from 'src/app/directives/sortable/sortable.directive';
import { CustomerPayment } from 'src/app/models/customer/customer-payment';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { CustomerPaymentService } from 'src/app/services/customer-payment/customer-payment.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { PaymentComponent } from '../payment/payment.component';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css'],
})
export class PaymentListComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  customerPayments$: Observable<CustomerPayment[]>;
  total$: Observable<number>;
  totalAmount$: Observable<any>;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ကုန်သည်လွှဲငွေပြင်ဆင်ခြင်း။',
    hideFooter: false,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public customerPaymentService: CustomerPaymentService,
    public dateRangeService: DateRangeService,
    private _modalService: NgbModal,
    private _alertModalService: AlertModalService
  ) {
    this.customerPayments$ = customerPaymentService.customerPayments$;
    this.total$ = customerPaymentService.total$;
    this.totalAmount$ = customerPaymentService.totalAmount$;

    customerPaymentService.searchList = '';

    this.dateRangeService.fromDate = customerPaymentService.fromDate;
    this.dateRangeService.toDate = customerPaymentService.toDate;

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.customerPaymentService.sortColumn = column;
    this.customerPaymentService.sortDirection = direction;
  }

  onDateSelection(date: NgbDate) {
    if (!this.dateRangeService.fromDate && !this.dateRangeService.toDate) {
      this.dateRangeService.fromDate = date;

      this.customerPaymentService.fromDate = this.dateRangeService.fromDate;
    } else if (
      this.dateRangeService.fromDate &&
      !this.dateRangeService.toDate &&
      date &&
      date.after(this.dateRangeService.fromDate)
    ) {
      this.dateRangeService.toDate = date;

      this.customerPaymentService.toDate = this.dateRangeService.toDate;
    } else {
      this.dateRangeService.toDate = null;
      this.dateRangeService.fromDate = date;

      this.customerPaymentService.fromDate = this.dateRangeService.fromDate;
      this.customerPaymentService.toDate = null;
    }
  }

  openCreateCustomerPayment() {
    this._modalService.open(PaymentComponent, {
      backdrop: 'static',
      animation: true,
    });
  }

  openEditCustomerPayment(customerPayment: CustomerPayment) {
    const modalRef = this._modalService.open(PaymentComponent, {
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.editCustomerPayment = customerPayment;
  }

  deleteCustomerPayment(customerPaymentId: number) {
    this.alertModalConfig.hideFooter = false;
    this._alertModalService.setAlertModalConfig(this.alertModalConfig);

    this._alertModalService.open(
      'ဤကုန်သည်လွှဲငွေကို ဖျက်မှာသေချာပါသလား?',
      'warning'
    );
    this._alertModalService.onDismiss
      .pipe(
        takeUntil(this._alertModalService.onClose),
        switchMap((action) => {
          if (action === 'dismiss') {
            this.alertModalConfig.hideFooter = true;
            this._alertModalService.setAlertModalConfig(this.alertModalConfig);

            return this.customerPaymentService.deleteCustomerPayment(
              customerPaymentId
            );
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res) => {
          this._alertModalService.open(
            'ကုန်သည်လွှဲငွေဖျက်သိမ်းပြီးပါပြီ။',
            'success'
          );
        },
        error: (err) => {
          this._alertModalService.open(err, 'danger');
        },
      });
  }
}
