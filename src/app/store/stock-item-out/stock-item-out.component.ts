import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { StockItem } from 'src/app/models/stock-item';
import { StockItemOut } from 'src/app/models/stock-item-out';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { StockItemOutService } from 'src/app/services/stock-item-out/stock-item-out.service';
import { StockItemService } from 'src/app/services/stock-item/stock-item.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';

@Component({
  selector: 'app-stock-item-out',
  templateUrl: './stock-item-out.component.html',
  styleUrls: ['./stock-item-out.component.css'],
})
export class StockItemOutComponent implements OnInit, OnDestroy {
  @Input()
  stockItem!: StockItem;

  @Input()
  editStockItemOut!: StockItemOut;

  @Output()
  isSuccess: Subject<void> = new Subject<void>();

  destroy$: Subject<void> = new Subject<void>();

  stockItemOutForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'လှောင်ကုန်ထုတ်ယူ သိမ်းဆည်းခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    public stockItemOutService: StockItemOutService,
    private _stockItemService: StockItemService,
    private _formBuilder: FormBuilder,
    private _alertModalService: AlertModalService
  ) {
    this.stockItemOutForm = this._formBuilder.group({
      outDate: [new Date(), Validators.required],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      qty: [
        0,
        [Validators.required, Validators.min(0), this.exceedQtyValidator()],
      ],
      weight: [
        0,
        [Validators.required, Validators.min(0), this.exceedWeightValidator()],
      ],
      stockItemId: [null, Validators.required],
      commission: [
        0,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      commissionFee: [0, [Validators.required, Validators.min(0)]],
      totalPrice: [0, Validators.required],
    });

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  get outDate(): AbstractControl {
    return this.stockItemOutForm.get('outDate') as FormControl;
  }

  get unitPrice(): AbstractControl {
    return this.stockItemOutForm.get('unitPrice') as FormControl;
  }

  get qty(): AbstractControl {
    return this.stockItemOutForm.get('qty') as FormControl;
  }

  get weight(): AbstractControl {
    return this.stockItemOutForm.get('weight') as FormControl;
  }

  get commission(): AbstractControl {
    return this.stockItemOutForm.get('commission') as FormControl;
  }

  get commissionFee(): AbstractControl {
    return this.stockItemOutForm.get('commissionFee') as FormControl;
  }

  get totalPrice(): AbstractControl {
    return this.stockItemOutForm.get('totalPrice') as FormControl;
  }

  get stockItemId(): AbstractControl {
    return this.stockItemOutForm.get('stockItemId') as FormControl;
  }

  ngOnInit() {
    if (this.stockItem) {
      this.stockItemId.setValue(this.stockItem.id);
    }

    if (this.editStockItemOut) {
      this.stockItemOutForm.patchValue({
        outDate: new Date(this.editStockItemOut.outDate),
        unitPrice: this.editStockItemOut.unitPrice,
        qty: this.editStockItemOut.qty,
        weight: this.editStockItemOut.weight,
        commission: this.editStockItemOut.commission,
        commissionFee: this.editStockItemOut.commissionFee,
        totalPrice: this.editStockItemOut.totalPrice,
        stockItemId: this.editStockItemOut.stockItemId,
      });
    }

    this.unitPrice.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateTotalPrice();
    });

    this.weight.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.calculateTotalPrice();
    });

    this.commission.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.calculateTotalPrice();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.isSuccess.complete();
  }

  onSubmit() {
    if (this.stockItemOutForm.invalid) {
      return;
    }

    if (this.editStockItemOut) {
      this.stockItemOutService
        .updateStockItemOut(
          this.editStockItemOut.id,
          this.stockItemOutForm.value
        )
        .subscribe({
          next: (res) => {
            this._stockItemService.searchList = '';
            this.activeModal.close();
            this._alertModalService.open(
              'လှောင်ကုန်ထုတ်ယူမှုသိမ်းဆည်းပြီးပါပြီ။',
              'success'
            );
            this.isSuccess.next();
          },
          error: (err) => {
            this._alertModalService.open(err, 'danger');
          },
        });
    } else {
      this.stockItemOutService
        .createStockItemOut(this.stockItemOutForm.value)
        .subscribe({
          next: (res) => {
            this._stockItemService.searchList = '';
            this.activeModal.close();
            this._alertModalService.open(
              'လှောင်ကုန်ထုတ်ယူမှုသိမ်းဆည်းပြီးပါပြီ။',
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

  exceedWeightValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      const leftWeight =
        this.stockItem?.weight -
        Number(this.stockItem?.totalWeightOut) +
        (this.editStockItemOut ? Number(this.editStockItemOut.weight) : 0);

      if (value === null || value === undefined || value > leftWeight) {
        return { exceedWeight: true };
      }
      return null;
    };
  }

  exceedQtyValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      const leftQty =
        this.stockItem?.qty -
        Number(this.stockItem?.totalQtyOut) +
        (this.editStockItemOut ? Number(this.editStockItemOut.qty) : 0);
      if (value === null || value === undefined || value > leftQty) {
        return { exceedQty: true };
      }
      return null;
    };
  }

  calculateTotalPrice() {
    const weight = Number(this.weight.value) || 0;
    const unitPrice = Number(this.unitPrice.value) || 0;
    const commission = Number(this.commission.value) || 0;

    const totalPrice = unitPrice * weight;
    const commissionFee = (totalPrice * commission) / 100;

    this.commissionFee.setValue(commissionFee);
    this.totalPrice.setValue(commissionFee + totalPrice);
  }
}
