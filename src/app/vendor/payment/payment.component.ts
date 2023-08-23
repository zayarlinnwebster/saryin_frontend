import { Component, Input } from '@angular/core';
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
import { Vendor } from 'src/app/models/vendor/vendor';
import { VendorPayment } from 'src/app/models/vendor/vendor-payment';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { VendorPaymentService } from 'src/app/services/vendor-payment/vendor-payment.service';
import { VendorService } from 'src/app/services/vendor/vendor.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { PAID_TYPES } from 'src/app/shared/constants';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent {
  @Input()
  editVendorPayment!: VendorPayment;
  paidTypes: string[] = PAID_TYPES;
  remainingAmount: number = 0;

  dropdownVendors$: Observable<Vendor[]>;

  vendorPaymentForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ပွဲရုံသွင်းငွေအသစ် သိမ်းဆည်းခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    public vendorPaymentService: VendorPaymentService,
    public vendorService: VendorService,
    private _formBuilder: FormBuilder,
    private _alertModalService: AlertModalService
  ) {
    this.dropdownVendors$ = vendorService.dropdownVendors$;
    vendorService.dropdownSearch$.next('');

    this.vendorPaymentForm = this._formBuilder.group({
      paymentDate: [new Date(), Validators.required],
      paidAmount: ['', [Validators.required, Validators.min(0)]],
      paidBy: ['Cash', Validators.required],
      transactionNo: [''],
      vendorId: [null, Validators.required],
    });

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  get paymentDate(): AbstractControl {
    return this.vendorPaymentForm.get('paymentDate') as FormControl;
  }

  get paidAmount(): AbstractControl {
    return this.vendorPaymentForm.get('paidAmount') as FormControl;
  }

  get paidBy(): AbstractControl {
    return this.vendorPaymentForm.get('paidBy') as FormControl;
  }

  get transactionNo(): AbstractControl {
    return this.vendorPaymentForm.get('transactionNo') as FormControl;
  }

  get vendorId(): AbstractControl {
    return this.vendorPaymentForm.get('vendorId') as FormControl;
  }

  ngOnInit() {
    if (this.editVendorPayment) {
      this.vendorPaymentForm.patchValue({
        paymentDate: new Date(this.editVendorPayment.paymentDate),
        paidAmount: this.editVendorPayment.paidAmount,
        paidBy: this.editVendorPayment.paidBy,
        transactionNo: this.editVendorPayment.transactionNo,
        vendorId: this.editVendorPayment.vendorId,
      });

      this.onSelectVendor(this.editVendorPayment);
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

  onSelectVendor({
    totalInvoiceAmount,
    totalPaidAmount,
  }: {
    totalInvoiceAmount: number;
    totalPaidAmount: number;
  }) {
    if (totalInvoiceAmount || totalPaidAmount) {
      this.remainingAmount =
        Number(totalInvoiceAmount) - Number(totalPaidAmount);
    } else {
      this.remainingAmount = 0;
    }
  }

  onSubmit() {
    if (this.vendorPaymentForm.invalid) {
      return;
    }

    const transformedData = transformFormData(this.vendorPaymentForm.value);

    if (this.editVendorPayment) {
      this.vendorPaymentService
        .updateVendorPayment(this.editVendorPayment.id, transformedData)
        .subscribe({
          next: (res) => {
            this.activeModal.close();
            this._alertModalService.open(
              'ပွဲရုံသွင်းငွေအသစ်သိမ်းဆည်းပြီးပါပြီ။',
              'success'
            );
          },
          error: (err) => {
            this._alertModalService.open(err, 'danger');
          },
        });
    } else {
      this.vendorPaymentService.createVendorPayment(transformedData).subscribe({
        next: (res) => {
          this.activeModal.close();
          this._alertModalService.open(
            'ပွဲရုံသွင်းငွေအသစ်သိမ်းဆည်းပြီးပါပြီ။',
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
