import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, switchMap, takeUntil } from 'rxjs';
import { SortableDirective, SortEvent } from 'src/app/directives/sortable/sortable.directive';
import { CustomerPayment } from 'src/app/models/customer/customer-payment';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { CustomerPaymentService } from 'src/app/services/customer-payment/customer-payment.service';
import { FinancialCustomerPaymentService } from 'src/app/services/financial/payment/financial-customer-payment.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';
import { PaymentComponent } from 'src/app/customer/payment/payment.component';

@Component({
  selector: 'app-customer-payment-table',
  templateUrl: './customer-payment-table.component.html',
  styleUrls: ['./customer-payment-table.component.css']
})
export class CustomerPaymentTableComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  customerPayments$: Observable<CustomerPayment[]>;
  total$: Observable<number>;

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
    public financialCustomerPaymentService: FinancialCustomerPaymentService,
    private _modalService: NgbModal,
    private _alertModalService: AlertModalService
  ) {
    this.customerPayments$ = financialCustomerPaymentService.customerPayments$;
    this.total$ = financialCustomerPaymentService.total$;
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

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.financialCustomerPaymentService.sortColumn = column;
    this.financialCustomerPaymentService.sortDirection = direction;
  }
}
