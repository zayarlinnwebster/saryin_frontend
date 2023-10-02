import { Component, Input, OnDestroy, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, combineLatest } from 'rxjs';
import { Customer } from 'src/app/models/customer/customer';
import { Item } from 'src/app/models/item';
import { StockItem } from 'src/app/models/stock-item';
import { Store } from 'src/app/models/store';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { ItemService } from 'src/app/services/item/item.service';
import { StockItemService } from 'src/app/services/stock-item/stock-item.service';
import { StoreService } from 'src/app/services/store/store.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';

@Component({
  selector: 'app-stock-item',
  templateUrl: './stock-item.component.html',
  styleUrls: ['./stock-item.component.css']
})
export class StockItemComponent implements OnDestroy{
  @Input()
  editStockItem!: StockItem;

  @Output()
  isSuccess: Subject<void> = new Subject<void>();

  dropdownCustomers$: Observable<Customer[]>;
  dropdownItem$: Observable<Item[]>;
  dropdownStore$: Observable<Store[]>;


  stockItemForm: FormGroup;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'လှောင်ကုန်အသစ် သိမ်းဆည်းခြင်း။',
    hideFooter: true,
  };

  constructor(
    public activeModal: NgbActiveModal,
    public stockItemService: StockItemService,
    public customerService: CustomerService,
    public itemService: ItemService,
    public storeService: StoreService,
    private _formBuilder: FormBuilder,
    private _alertModalService: AlertModalService
  ) {
    this.dropdownCustomers$ = customerService.dropdownCustomers$;
    customerService.dropdownSearch$.next('');

    this.dropdownItem$ = itemService.dropdownItems$;
    itemService.dropdownSearch$.next('');

    this.dropdownStore$ = storeService.dropdownStores$;
    storeService.dropdownSearch$.next('');

    this.stockItemForm = this._formBuilder.group({
      storedDate: [new Date(), Validators.required],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      qty: ['', [Validators.required, Validators.min(1)]],
      weight: ['', [Validators.required,  Validators.min(1)]],
      itemId: [null, Validators.required],
      customerId: [null, Validators.required],
      storeId: [null, Validators.required],
      totalPrice: [0, Validators.required],
    });

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  get storedDate(): AbstractControl {
    return this.stockItemForm.get('storedDate') as FormControl;
  }

  get unitPrice(): AbstractControl {
    return this.stockItemForm.get('unitPrice') as FormControl;
  }

  get qty(): AbstractControl {
    return this.stockItemForm.get('qty') as FormControl;
  }

  get weight(): AbstractControl {
    return this.stockItemForm.get('weight') as FormControl;
  }

  get totalPrice(): AbstractControl {
    return this.stockItemForm.get('totalPrice') as FormControl;
  }

  get itemId(): AbstractControl {
    return this.stockItemForm.get('itemId') as FormControl;
  }

  get customerId(): AbstractControl {
    return this.stockItemForm.get('customerId') as FormControl;
  }

  get storeId(): AbstractControl {
    return this.stockItemForm.get('storeId') as FormControl;
  }

  ngOnInit() {
    if (this.editStockItem) {
      this.stockItemForm.patchValue({
        storedDate: new Date(this.editStockItem.storedDate),
        itemId: this.editStockItem.itemId,
        customerId: this.editStockItem.customerId,
        storeId: this.editStockItem.storeId,
        unitPrice: this.editStockItem.unitPrice,
        qty: this.editStockItem.qty,
        weight: this.editStockItem.weight,
        totalPrice: this.editStockItem.totalPrice,
      });
    }

    combineLatest([
      this.weight.valueChanges,
      this.unitPrice.valueChanges
    ]).subscribe(([weight, unitPrice]) => {
      this.totalPrice.setValue(weight * unitPrice);
    });
  }

  ngOnDestroy(): void {
    this.isSuccess.complete();
  }

  onSubmit() {
    if (this.stockItemForm.invalid) {
      return;
    }

    if (this.editStockItem) {
      this.stockItemService
        .updateStockItem(this.editStockItem.id, this.stockItemForm.value)
        .subscribe({
          next: (res) => {
            this.activeModal.close();
            this._alertModalService.open(
              'လှောင်ကုန်အသစ်သိမ်းဆည်းပြီးပါပြီ။',
              'success'
            );
            this.isSuccess.next();
          },
          error: (err) => {
            this._alertModalService.open(err, 'danger');
          },
        });
    } else {
      this.stockItemService.createStockItem(this.stockItemForm.value).subscribe({
        next: (res) => {
          this.activeModal.close();
          this._alertModalService.open(
            'လှောင်ကုန်အသစ်သိမ်းဆည်းပြီးပါပြီ။',
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

}
