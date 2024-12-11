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
import { FinancialStatement } from 'src/app/models/financial/financial-statement';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { CustomerPaymentService } from 'src/app/services/customer-payment/customer-payment.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { FinancialStatementService } from 'src/app/services/financial/financial-statement.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { PAID_TYPES } from 'src/app/shared/constants';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  @Input() editCustomerPayment!: CustomerPayment;

  paidTypes: string[] = PAID_TYPES;
  remainingAmount = 0;

  dropdownCustomers$: Observable<Customer[]>;
  dropdownFinancialStatement$: Observable<FinancialStatement[]>;

  customerPaymentForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ကုန်သည်လွှဲငွေအသစ် သိမ်းဆည်းခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    public customerPaymentService: CustomerPaymentService,
    public customerService: CustomerService,
    public financialStatementService: FinancialStatementService,
    private formBuilder: FormBuilder,
    private alertModalService: AlertModalService
  ) {
    this.dropdownCustomers$ = this.customerService.dropdownCustomers$;
    this.dropdownFinancialStatement$ = this.financialStatementService.dropdownFinancialStatements$;
    this.customerService.dropdownSearch$.next('');

    this.customerPaymentForm = this.formBuilder.group({
      paymentDate: [new Date(), Validators.required],
      paidAmount: ['', [Validators.required, Validators.min(0)]],
      paidBy: ['Cash', Validators.required],
      transactionNo: [''],
      commission: ['', [Validators.required, Validators.min(0)]],
      customerId: [null, Validators.required],
      financialStatementId: [null],
    });

    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  get formControls() {
    return this.customerPaymentForm.controls;
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

  get financialStatementId(): AbstractControl {
    return this.customerPaymentForm.get('financialStatementId') as FormControl;
  }

  ngOnInit(): void {
    this.handleCustomerIdChanges();
    this.initializeEditMode();
  }

  private handleCustomerIdChanges(): void {
    this.customerId.valueChanges.subscribe((customerId) => {
      this.financialStatementService.customerId$.next(customerId);
    });
  }

  private initializeEditMode(): void {
    if (this.editCustomerPayment) {
      this.customerPaymentForm.patchValue({
        paymentDate: new Date(this.editCustomerPayment.paymentDate),
        paidAmount: this.editCustomerPayment.paidAmount,
        paidBy: this.editCustomerPayment.paidBy,
        transactionNo: this.editCustomerPayment.transactionNo,
        customerId: this.editCustomerPayment.customerId,
        commission: this.editCustomerPayment.commission,
        financialStatementId: this.editCustomerPayment.financialStatementId,
      });

      this.onSelectCustomer({
        totalInvoiceAmount: this.editCustomerPayment.totalInvoiceAmount,
        totalPaidAmount: this.editCustomerPayment.totalPaidAmount,
        commission: this.editCustomerPayment.customer.commission,
      });
    }
  }

  onSelectCustomer({
    totalInvoiceAmount,
    totalPaidAmount,
    commission,
  }: {
    totalInvoiceAmount: number;
    totalPaidAmount: number;
    commission: number;
  }): void {
    this.commission.setValue(commission);
    this.remainingAmount = totalInvoiceAmount
      ? Number(totalInvoiceAmount) -
      Number(totalPaidAmount) +
      (Number(totalInvoiceAmount) * commission) / 100
      : 0;
  }

  onSubmit(): void {
    if (this.customerPaymentForm.invalid) {
      return;
    }

    const transformedData = transformFormData(this.customerPaymentForm.getRawValue());

    const request = this.editCustomerPayment
      ? this.customerPaymentService.updateCustomerPayment(
        this.editCustomerPayment.id,
        transformedData
      )
      : this.customerPaymentService.createCustomerPayment(transformedData);

    request.subscribe({
      next: () => {
        this.activeModal.close();
        this.alertModalService.open('ကုန်သည်လွှဲငွေအသစ်သိမ်းဆည်းပြီးပါပြီ။', 'success');
      },
      error: (err) => {
        this.alertModalService.open(err, 'danger');
      },
    });
  }
}
