import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { transformFormData } from 'src/app/core/utils/form-utils';
import { Customer } from 'src/app/models/customer/customer';
import { CustomerPayment } from 'src/app/models/customer/customer-payment';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { CustomerPaymentService } from 'src/app/services/customer-payment/customer-payment.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { PAID_TYPES } from 'src/app/shared/constants';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  @Input()
  editCustomerPayment!: CustomerPayment;
  paidTypes: string[] = PAID_TYPES;
  remainingAmount: number = 0;

  dropdownCustomers$: Observable<Customer[]>;

  customerPaymentForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ကုန်သည်လွှဲငွေအသစ် သိမ်းဆည်းခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    public customerPaymentService: CustomerPaymentService,
    public customerService: CustomerService,
    private _formBuilder: FormBuilder,
    private _alertModalService: AlertModalService
  ) {
    this.dropdownCustomers$ = customerService.dropdownCustomers$;
    customerService.dropdownSearch$.next('');

    this.customerPaymentForm = this._formBuilder.group({
      paymentDate: [new Date(), Validators.required],
      paidAmount: ['', [Validators.required, Validators.min(0)]],
      paidBy: ['Cash', Validators.required],
      transactionNo: [''],
      commission: ['', [Validators.required, Validators.min(0)]],
      customerId: [null, Validators.required],
    });

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  get paymentDate(): AbstractControl {
    return this.customerPaymentForm.get('paymentDate') as FormControl;
  }

  get paidAmount(): AbstractControl {
    return this.customerPaymentForm.get('paidAmount') as FormControl;
  }

  get paidBy(): AbstractControl {
    return this.customerPaymentForm.get('paidBy') as FormControl;
  }

  get transactionNo(): AbstractControl {
    return this.customerPaymentForm.get('transactionNo') as FormControl;
  }

  get customerId(): AbstractControl {
    return this.customerPaymentForm.get('customerId') as FormControl;
  }

  get commission(): AbstractControl {
    return this.customerPaymentForm.get('commission') as FormControl;
  }

  ngOnInit() {
    if (this.editCustomerPayment) {
      this.customerPaymentForm.patchValue({
        paymentDate: new Date(this.editCustomerPayment.paymentDate),
        paidAmount: this.editCustomerPayment.paidAmount,
        paidBy: this.editCustomerPayment.paidBy,
        transactionNo: this.editCustomerPayment.transactionNo,
        customerId: this.editCustomerPayment.customerId,
        commission: this.editCustomerPayment.commission,
      });

      this.onSelectCustomer({
        ...this.editCustomerPayment,
        commission: this.editCustomerPayment.customer.commission,
      });
    }

    this.paidBy.valueChanges.subscribe((value) => {
      if (value === 'Cash') {
        this.transactionNo.clearValidators(); // Remove any existing validators
      } else {
        this.transactionNo.setValidators([Validators.required]);
      }

      this.transactionNo.updateValueAndValidity(); // Update the control's validation state
    });
  }

  onSelectCustomer({
    totalInvoiceAmount,
    totalPaidAmount,
    commission,
  }: {
    totalInvoiceAmount: number;
    totalPaidAmount: number;
    commission: number;
  }) {
    this.commission.setValue(commission);

    if (totalInvoiceAmount || totalPaidAmount) {
      this.remainingAmount =
        Number(totalInvoiceAmount) -
        Number(totalPaidAmount) +
        (Number(totalInvoiceAmount) * Number(commission)) / 100;
    } else {
      this.remainingAmount = 0;
    }
  }

  onSubmit() {
    if (this.customerPaymentForm.invalid) {
      return;
    }

    const transformedData = transformFormData(this.customerPaymentForm.value);

    if (this.editCustomerPayment) {
      this.customerPaymentService
        .updateCustomerPayment(this.editCustomerPayment.id, transformedData)
        .subscribe({
          next: (res) => {
            this.activeModal.close();
            this._alertModalService.open(
              'ကုန်သည်လွှဲငွေအသစ်သိမ်းဆည်းပြီးပါပြီ။',
              'success'
            );
          },
          error: (err) => {
            this._alertModalService.open(err, 'danger');
          },
        });
    } else {
      this.customerPaymentService
        .createCustomerPayment(transformedData)
        .subscribe({
          next: (res) => {
            this.activeModal.close();
            this._alertModalService.open(
              'ကုန်သည်လွှဲငွေအသစ်သိမ်းဆည်းပြီးပါပြီ။',
              'success'
            );
          },
          error: (err) => {
            this._alertModalService.open(err, 'danger');
          },
        });
    }
  }
}
