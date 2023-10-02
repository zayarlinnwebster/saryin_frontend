import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, map, takeUntil } from 'rxjs';
import { transformFormData } from 'src/app/core/utils/form-utils';
import { Customer } from 'src/app/models/customer/customer';
import { Invoice } from 'src/app/models/invoice/invoice';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { InvoiceService } from 'src/app/services/invoice/invoice.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { validateItems } from 'src/app/core/utils/form-array-validation';
import { faWarehouse } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class InvoiceComponent implements OnInit, OnDestroy {
  @Input()
  editInvoice!: Invoice;
  destroy$: Subject<void> = new Subject<void>();

  faWarehouse = faWarehouse;

  isFullscreen: boolean = true;

  dropdownCustomers$: Observable<Customer[]>;
  invoiceForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'နယ်ပို့စာရင်း သိမ်းဆည်းခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    public customerService: CustomerService,
    public invoiceService: InvoiceService,
    private _formBuilder: FormBuilder,
    private _alertModalService: AlertModalService
  ) {
    this.dropdownCustomers$ = customerService.dropdownCustomers$;
    customerService.dropdownSearch$.next('');

    this.invoiceForm = this._formBuilder.group({
      invoiceDate: [new Date(), Validators.required],
      customerId: [null, Validators.required],
      invoiceDetails: this._formBuilder.array(
        [],
        [Validators.required, validateItems]
      ),
      totalAmount: [0, [Validators.required]],
    });

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  get invoiceDate(): AbstractControl {
    return this.invoiceForm.get('invoiceDate') as FormControl;
  }

  get totalAmount(): AbstractControl {
    return this.invoiceForm.get('totalAmount') as FormControl;
  }

  get customerId(): AbstractControl {
    return this.invoiceForm.get('customerId') as FormControl;
  }

  get invoiceDetails(): FormArray {
    return this.invoiceForm.get('invoiceDetails') as FormArray;
  }

  ngOnInit() {
    if (this.editInvoice) {
      this.invoiceForm.patchValue({
        invoiceDate: new Date(this.editInvoice.invoiceDate),
        customerId: this.editInvoice.customerId,
        totalAmount: Number(this.editInvoice.totalAmount),
      });

      this.invoiceService
        .getInvoice(this.editInvoice.id)
        .pipe(
          takeUntil(this.destroy$),
          map((invoice) => invoice.invoiceDetails)
        )
        .subscribe((invoiceDetails) => {
          for (let invoiceDetail of invoiceDetails) {
            this.patchInvoiceDetail({
              ...invoiceDetail,
            });
          }
        });
    } else {
      this.createInvoiceDetail();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkInvoiceDetails(invoiceDetail: FormGroup) {
    const formControls = ['unitPrice', 'weight', 'laborFee', 'generalFee'];

    const totalPriceControl = invoiceDetail.get('totalPrice') as FormControl;

    formControls.forEach((controlName) => {
      const control = invoiceDetail.get(controlName) as FormControl;

      control.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
        const unitPrice = invoiceDetail.get('unitPrice')?.value;
        const weight = invoiceDetail.get('weight')?.value;
        const laborFee = invoiceDetail.get('laborFee')?.value;
        const generalFee = invoiceDetail.get('generalFee')?.value;

        const totalPrice = this.getTotalPrice(
          unitPrice,
          weight,
          laborFee,
          generalFee
        );

        totalPriceControl.setValue(totalPrice);
      });
    });

    totalPriceControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.setTotalAmount();
      });

    const isStoreItem = invoiceDetail.get('isStoreItem') as FormControl;
    const storeId = invoiceDetail.get('storeId') as FormControl;
    const storedDate = invoiceDetail.get('storedDate') as FormControl;

    this.setupStoreItemValidation(isStoreItem, storeId, storedDate);
  }

  private setupStoreItemValidation(
    isStoreItem: FormControl,
    storeId: FormControl,
    storedDate: FormControl
  ) {
    isStoreItem.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((isStoreItemValue) => {
        if (isStoreItemValue) {
          storeId.setValidators(Validators.required);
          storedDate.setValidators(Validators.required);
        } else {
          storeId.clearValidators();
          storedDate.clearValidators();
        }

        storeId.updateValueAndValidity();
        storedDate.updateValueAndValidity();
      });
  }

  getTotalPrice(
    unitPrice: number = 0,
    weight: number = 0,
    laborFee: number = 0,
    generalFee: number = 0
  ): number {
    const totalPrice = Math.round(
      Number(weight) * Number(unitPrice) + Number(laborFee) + Number(generalFee)
    );

    return totalPrice;
  }

  setTotalAmount() {    
    let amount = 0;

    for (let invoiceDetail of this.invoiceDetails.controls) {
      const totalPrice = invoiceDetail.get('totalPrice')?.value || 0;

      amount += Number(totalPrice);
    }

    this.totalAmount.setValue(amount);
  }

  createInvoiceDetail() {
    const invoiceDetailForm = this._formBuilder.group({
      id: [null],
      vendorId: [null, Validators.required],
      itemId: [null, Validators.required],
      qty: [1, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      weight: [0, [Validators.required, Validators.min(0)]],
      laborFee: [0, [Validators.required, Validators.min(0)]],
      generalFee: [0, [Validators.required, Validators.min(0)]],
      totalPrice: [0, Validators.required],
      isBillCleared: [false, [Validators.required]],
      isStoreItem: [false, [Validators.required]],
      storeId: [null],
      storedDate: [new Date()],
      remark: [null],
    });

    this.checkInvoiceDetails(invoiceDetailForm);

    this.invoiceDetails.push(invoiceDetailForm);
  }

  patchInvoiceDetail(invoiceDetail: InvoiceDetail) {
    const invoiceDetailForm = this._formBuilder.group({
      id: [invoiceDetail.id],
      vendorId: [invoiceDetail.vendorId, Validators.required],
      itemId: [invoiceDetail.item?.id, Validators.required],
      qty: [invoiceDetail.qty, [Validators.required, Validators.min(0)]],
      unitPrice: [
        invoiceDetail.unitPrice,
        [Validators.required, Validators.min(0)],
      ],
      weight: [invoiceDetail.weight, [Validators.required, Validators.min(0)]],
      laborFee: [
        invoiceDetail.laborFee,
        [Validators.required, Validators.min(0)],
      ],
      generalFee: [
        invoiceDetail.generalFee,
        [Validators.required, Validators.min(0)],
      ],
      totalPrice: [invoiceDetail.totalPrice, Validators.required],
      isBillCleared: [invoiceDetail.isBillCleared, Validators.required],
      isStoreItem: [invoiceDetail.isStoreItem, Validators.required],
      storeId: [invoiceDetail.stockItem?.storeId],
      storedDate: [
        invoiceDetail.stockItem?.storedDate
          ? new Date(invoiceDetail.stockItem?.storedDate)
          : null,
      ],
      remark: [invoiceDetail.remark],
    });

    this.checkInvoiceDetails(invoiceDetailForm);

    this.invoiceDetails.push(invoiceDetailForm);
  }

  separateInvoice() {
    if (this.invoiceForm.invalid || !this.editInvoice) {
      return;
    }

    const formData = transformFormData(this.invoiceForm.value);

    this.invoiceService.separateInvoice(this.editInvoice.id, formData).subscribe({
      next: (res) => {
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

  onSubmit() {
    if (this.invoiceForm.invalid) {
      return;
    }

    const formData = transformFormData(this.invoiceForm.value);

    if (this.editInvoice) {
      this.invoiceService
        .updateInvoice(this.editInvoice.id, formData)
        .subscribe({
          next: (res) => {
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
    } else {
      this.invoiceService.createInvoice(formData).subscribe({
        next: (res) => {
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
}
