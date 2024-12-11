import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbActiveModal, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { transformFormData } from 'src/app/core/utils/form-utils';
import { Customer } from 'src/app/models/customer/customer';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { FinancialStatement } from 'src/app/models/financial/financial-statement';
import { FinancialStatementService } from 'src/app/services/financial/financial-statement.service';
import { FinancialPaymentService } from 'src/app/services/financial/payment/financial-payment.service';
import { fromDateToNgbDate, fromNgbDateToDate } from 'src/app/core/utils/date-utils';
import { FinancialInvoiceService } from 'src/app/services/financial/invoice/financial-invoice.service';
import { CustomerDetailService } from 'src/app/services/customer-detail/customer-detail.service';
import { CustomerUsage } from 'src/app/models/customer/customer-usage';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';

@Component({
  selector: 'app-financial-statement',
  templateUrl: './financial-statement.component.html',
  styleUrls: ['./financial-statement.component.css']
})
export class FinancialStatementComponent implements OnInit, OnDestroy {
  customerUsage!: CustomerUsage;
  customer$: Observable<Customer>;
  destroy$: Subject<void> = new Subject<void>();
  isFullscreen: boolean = true;

  dropdownCustomers$: Observable<Customer[]>;
  financialStatementForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'နှစ်ချုပ်စာရင်း သိမ်းဆည်းခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    public customerService: CustomerService,
    public financialStatementService: FinancialStatementService,
    public financialPaymentService: FinancialPaymentService,
    public financialInvoiceService: FinancialInvoiceService,
    public customerDetailService: CustomerDetailService,
    private _dateRangeService: DateRangeService,
    private _formBuilder: FormBuilder,
    private _alertModalService: AlertModalService
  ) {
    this.setDateRangesForServices();

    const yearStartDate = fromNgbDateToDate(this._dateRangeService.yearFirstDate);
    const yearEndDate = fromNgbDateToDate(this._dateRangeService.yearLastDate);

    this.dropdownCustomers$ = customerService.dropdownCustomers$;
    customerService.dropdownSearch$.next('');

    this.financialStatementForm = this._formBuilder.group({
      financialStartDate: [yearStartDate, Validators.required],
      financialEndDate: [yearEndDate, Validators.required],
      remark: [null],
      customerId: [null, Validators.required],
      totalCustomerPayment: [0, [Validators.required]],
      totalCustomerInvoice: [0, [Validators.required]],
      totalStockInvoice: [0, [Validators.required]],
      totalItemCount: [0, [Validators.required, Validators.min(1)]],
      totalCommission: [0, [Validators.required]],
      totalLeftAmount: [0, [Validators.required]],
      totalBillClearedAmount: [0, [Validators.required]],
    });

    this.customer$ = this.customerId.valueChanges.pipe(
      takeUntil(this.destroy$),
      switchMap((customerId: number) => {
        if (!customerId) {
          return EMPTY;
        }

        return this.customerService.getCustomer(customerId);
      }));

    this.customerDetailService.customerUsage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((customerUsage: CustomerUsage) => {

        this.customerUsage = customerUsage;
        // Update the form controls dynamically when customer usage changes
        this.financialStatementForm.patchValue({
          totalCustomerPayment: customerUsage.totalCustomerPayment || 0,
          totalCustomerInvoice: customerUsage.totalCustomerInvoice || 0,
          totalStockInvoice: customerUsage.totalStockInvoice || 0,
          totalItemCount: customerUsage.totalItemCount || 0,
          totalCommission: customerUsage.totalCommission || 0,
          totalLeftAmount: customerUsage.totalLeftAmount || 0,
          totalBillClearedAmount: customerUsage.totalBillClearedAmount || 0,
        });
      });

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  // Getters for form controls
  get financialStartDate(): AbstractControl {
    return this.financialStatementForm.get('financialStartDate') as FormControl;
  }

  get financialEndDate(): AbstractControl {
    return this.financialStatementForm.get('financialEndDate') as FormControl;
  }

  get customerId(): AbstractControl {
    return this.financialStatementForm.get('customerId') as FormControl;
  }

  ngOnInit() {
    this.subscribeToCustomerIdChanges();
    this.subscribeToStartDateChanges();
    this.subscribeToEndDateChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private preFillForm(financialStatement: FinancialStatement): void {
    this.financialStatementForm.patchValue({
      financialStartDate: new Date(financialStatement.financialStartDate),
      financialEndDate: new Date(financialStatement.financialEndDate),
      remark: financialStatement.remark,
      customerId: financialStatement.customerId,
    });

    this.customerId.disable();
    // Trigger the valueChanges manually to update the observable
    this.customerId.updateValueAndValidity(); // This will trigger the valueChanges subscription
  }

  // Set date range values to services
  private setDateRangesForServices(): void {
    const yearFirstDate = this._dateRangeService.yearFirstDate;
    const yearLastDate = this._dateRangeService.yearLastDate;

    this.customerDetailService.fromDate = yearFirstDate;
    this.customerDetailService.toDate = yearLastDate;
    this.financialPaymentService.fromDate = yearFirstDate;
    this.financialPaymentService.toDate = yearLastDate;
    this.financialInvoiceService.fromDate = yearFirstDate;
    this.financialInvoiceService.toDate = yearLastDate;
  }

  // Subscription to customer ID changes
  private subscribeToCustomerIdChanges(): void {
    this.customerId.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((customerId: number | null) => {
        if (!customerId) {
          return;
        }
        this.updateServiceCustomerId(customerId);
      });
  }

  // Subscription to start date changes
  private subscribeToStartDateChanges(): void {
    this.financialStartDate.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: Date | null) => {
        if (!this.customerId.value) {
          return;
        }
        this.updateStartDateForServices(value);
      });
  }

  // Subscription to end date changes
  private subscribeToEndDateChanges(): void {
    this.financialEndDate.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: Date | null) => {
        if (!this.customerId.value) {
          return;
        }
        this.updateEndDateForServices(value);
      });
  }

  // Update service with customer ID
  private updateServiceCustomerId(customerId: number): void {
    this.financialPaymentService.customerId = customerId;
    this.financialInvoiceService.customerId = customerId;
    this.customerService.customerId = customerId;
    this.customerDetailService.customerId = customerId;
  }

  // Update start date for all services
  private updateStartDateForServices(value: Date | null): void {
    const ngbDate = <NgbDate>fromDateToNgbDate(value);
    this.financialPaymentService.fromDate = ngbDate;
    this.financialInvoiceService.fromDate = ngbDate;
    this.customerDetailService.fromDate = ngbDate;
  }

  // Update end date for all services
  private updateEndDateForServices(value: Date | null): void {
    const ngbDate = <NgbDate>fromDateToNgbDate(value);
    this.financialPaymentService.toDate = ngbDate;
    this.financialInvoiceService.toDate = ngbDate;
    this.customerDetailService.toDate = ngbDate;
  }

  onSubmit() {
    if (this.financialStatementForm.invalid) {
      return;
    }

    const formData = transformFormData(this.financialStatementForm.value);

    this.financialStatementService.createFinancialStatement(formData).subscribe({
      next: () => {
        this.activeModal.close();
        this._alertModalService.open(
          'နယ်ပို့စာရင်းသိမ်းဆည်းပြီးပါပြီ။',
          'success'
        );
      },
      error: (err) => {
        this._alertModalService.open(err, 'danger');
      },
    });
  }
}
