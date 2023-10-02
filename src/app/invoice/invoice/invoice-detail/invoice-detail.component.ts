import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { Item } from 'src/app/models/item';
import { Vendor } from 'src/app/models/vendor/vendor';
import { ItemService } from 'src/app/services/item/item.service';
import { VendorService } from 'src/app/services/vendor/vendor.service';
import { faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { Store } from 'src/app/models/store';
import { StoreService } from 'src/app/services/store/store.service';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css'],
})
export class InvoiceDetailComponent implements OnInit, OnDestroy {
  @Input() invoiceDetails!: FormArray;
  @Input() totalItemAmount!: AbstractControl<number>;
  @Output() remove = new EventEmitter<void>();

  faWarehouse = faWarehouse;

  destroy$: Subject<void> = new Subject<void>();
  totalAmount: number = 0;
  calculatingTotal: boolean = false;

  dropdownItems$: Observable<Item[]>;
  dropdownVendors$: Observable<Vendor[]>;
  dropdownStore$: Observable<Store[]>;

  constructor(
    public itemService: ItemService,
    public vendorService: VendorService,
    public storeService: StoreService
  ) {
    this.dropdownItems$ = itemService.dropdownItems$;
    itemService.dropdownSearch$.next('');
    this.dropdownVendors$ = vendorService.dropdownVendors$;
    vendorService.dropdownSearch$.next('');
    this.dropdownStore$ = storeService.dropdownStores$;
    storeService.dropdownSearch$.next('');
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.remove.complete();
  }

  get invoiceDetailForms(): FormGroup[] {
    return this.invoiceDetails.controls as FormGroup[];
  }

  removeInvoiceDetail(index: number): void {
    this.invoiceDetails.removeAt(index);
    this.remove.emit();
  }
}
