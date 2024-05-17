import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, takeUntil } from 'rxjs';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';
import { Item } from 'src/app/models/item';
import { Store } from 'src/app/models/store';
import { Vendor } from 'src/app/models/vendor/vendor';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { InvoiceDetailService } from 'src/app/services/invoice-detail/invoice-detail.service';
import { ItemService } from 'src/app/services/item/item.service';
import { StoreService } from 'src/app/services/store/store.service';
import { VendorService } from 'src/app/services/vendor/vendor.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';

@Component({
  selector: 'app-invoice-detail-edit',
  templateUrl: './invoice-detail-edit.component.html',
  styleUrls: ['./invoice-detail-edit.component.css'],
})
export class InvoiceDetailEditComponent implements OnInit, OnDestroy {
  @Input()
  editInvoiceDetail!: InvoiceDetail;

  @Output()
  isSuccess: Subject<void> = new Subject<void>();
  destroy$: Subject<void> = new Subject<void>();

  faWarehouse = faWarehouse;

  dropdownVendors$: Observable<Vendor[]>;
  dropdownItems$: Observable<Item[]>;
  dropdownStore$: Observable<Store[]>;

  invoiceDetailForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'နယ်ပို့စာရင်း ပြင်ဆင်ခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    public invoiceDetailService: InvoiceDetailService,
    public itemService: ItemService,
    public vendorService: VendorService,
    public storeService: StoreService,
    private _formBuilder: FormBuilder,
    private _alertModalService: AlertModalService
  ) {
    this.dropdownItems$ = itemService.dropdownItems$;
    itemService.dropdownSearch$.next('');
    this.dropdownVendors$ = vendorService.dropdownVendors$;
    vendorService.dropdownSearch$.next('');
    this.dropdownStore$ = storeService.dropdownStores$;
    storeService.dropdownSearch$.next('');

    this.invoiceDetailForm = this._formBuilder.group({
      id: [null],
      vendorId: [null, Validators.required],
      itemId: [null, Validators.required],
      qty: [1, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      weight: [0, [Validators.required, Validators.min(0)]],
      marLaKar: [null],
      laborFee: [0, [Validators.required, Validators.min(0)]],
      generalFee: [0, [Validators.required, Validators.min(0)]],
      totalPrice: [0, Validators.required],
      isBillCleared: [false, [Validators.required]],
      isStoreItem: [false, [Validators.required]],
      storeId: [null],
      storedDate: [new Date()],
      remark: [null],
    });
  }

  ngOnInit(): void {
    console.log(this.editInvoiceDetail);

    if (this.editInvoiceDetail) {
      this.invoiceDetailForm.patchValue({
        id: this.editInvoiceDetail.id,
        vendorId: this.editInvoiceDetail.vendorId,
        itemId: this.editInvoiceDetail.item?.id,
        qty: this.editInvoiceDetail.qty,

        unitPrice: this.editInvoiceDetail.unitPrice,
        weight: this.editInvoiceDetail.weight,
        marLaKar: this.editInvoiceDetail.stockItem?.marLaKar,
        laborFee: this.editInvoiceDetail.laborFee,

        generalFee: this.editInvoiceDetail.generalFee,
        totalPrice: this.editInvoiceDetail.totalPrice,

        isStoreItem: this.editInvoiceDetail.isStoreItem,
        storeId: this.editInvoiceDetail.stockItem?.storeId,
        storedDate: this.editInvoiceDetail.stockItem?.storedDate
          ? new Date(this.editInvoiceDetail.stockItem?.storedDate)
          : null,
        remark: this.editInvoiceDetail.remark,
      });

      this.checkInvoiceDetails(this.invoiceDetailForm);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.isSuccess.complete();
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

        const totalPrice = this.invoiceDetailService.getTotalPrice(
          unitPrice,
          weight,
          laborFee,
          generalFee
        );

        totalPriceControl.setValue(totalPrice);
      });
    });

    const isStoreItem = invoiceDetail.get('isStoreItem') as FormControl;
    const storeId = invoiceDetail.get('storeId') as FormControl;
    const storedDate = invoiceDetail.get('storedDate') as FormControl;

    this.invoiceDetailService.setupStoreItemValidation(
      isStoreItem,
      storeId,
      storedDate,
      this.destroy$
    );
  }

  onSubmit() {
    if (this.invoiceDetailForm.invalid) {
      return;
    }

    this.invoiceDetailService
      .updateInvoiceDetail(
        this.editInvoiceDetail.id,
        this.invoiceDetailForm.value
      )
      .subscribe({
        next: (res) => {
          this.activeModal.close();
          this._alertModalService.open(
            'နယ်ပို့စာရင်းသိမ်းဆည်းပြီးပါပြီ။',
            'success'
          );
          this.isSuccess.next();
        },
        error: (err) => {
          this._alertModalService.open(err, 'danger');
        },
      });
  }
}
