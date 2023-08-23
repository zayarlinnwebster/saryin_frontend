import { Component, EventEmitter, Output, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { CustomerPayment } from 'src/app/models/customer/customer-payment';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { CustomerDetailService } from 'src/app/services/customer-detail/customer-detail.service';
import { CustomerPaymentService } from 'src/app/services/customer-payment/customer-payment.service';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';
import { PaymentComponent } from '../../payment/payment.component';
import { SortEvent, SortableDirective } from 'src/app/directives/sortable/sortable.directive';

@Component({
  selector: 'app-customer-payment',
  templateUrl: './customer-payment.component.html',
  styleUrls: ['./customer-payment.component.css']
})
export class CustomerPaymentComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  payments$: Observable<CustomerPayment[]>;
  total$: Observable<number>;
  isDetailsOpen: boolean[] = [];

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ပွဲရုံလွှဲငွေပြင်ဆင်ခြင်း။',
    hideFooter: false,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public customerDetailService: CustomerDetailService,
    public dateRangeService: DateRangeService,
    private _modalService: NgbModal,
    private _alertModalService: AlertModalService,
    public customerPaymentService: CustomerPaymentService,
  ) {
    this.payments$ = customerDetailService.customerPayments
    this.total$ = customerDetailService.paymentTotal;
    customerDetailService.searchList = '';

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
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

  toggleDetails(index: number): void {
    this.isDetailsOpen[index] = !this.isDetailsOpen[index];
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
          this.customerDetailService.searchList = '';
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
