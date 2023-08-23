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
import { Observable, Subject, takeUntil } from 'rxjs';
import { transformFormData } from 'src/app/core/utils/form-utils';
import { Customer } from 'src/app/models/customer/customer';
import { Invoice } from 'src/app/models/invoice/invoice';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { InvoiceService } from 'src/app/services/invoice/invoice.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { validateItems } from 'src/app/core/utils/form-array-validation';

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

      for (let invoiceDetail of this.editInvoice.invoiceDetails) {
        this.patchInvoiceDetail(invoiceDetail);
      }
    } else {
      this.createInvoiceDetail();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  createInvoiceDetail() {
    const invoiceDetailForm = this._formBuilder.group({
      vendorId: [null, Validators.required],
      itemId: [null, Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      weight: [0, [Validators.required, Validators.min(1)]],
      laborFee: ['', [Validators.required, Validators.min(0)]],
      generalFee: ['', [Validators.required, Validators.min(0)]],
      totalPrice: [0, Validators.required],
    });

    this.invoiceDetails.push(invoiceDetailForm);
  }

  patchInvoiceDetail(invoiceDetail: InvoiceDetail) {
    const invoiceDetailForm = this._formBuilder.group({
      vendorId: [invoiceDetail.vendorId, Validators.required],
      itemId: [invoiceDetail.item?.id, Validators.required],
      qty: [invoiceDetail.qty, [Validators.required, Validators.min(1)]],
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
    });

    this.invoiceDetails.push(invoiceDetailForm);
  }

  onSubmit() {
    if (this.invoiceForm.invalid) {
      return;
    }

    this.invoiceForm.patchValue({
      ...transformFormData(this.invoiceForm.value),
    });

    if (this.editInvoice) {
      this.invoiceService
        .updateInvoice(this.editInvoice.id, this.invoiceForm.value)
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
      this.invoiceService.createInvoice(this.invoiceForm.value).subscribe({
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
