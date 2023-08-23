import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Item } from 'src/app/models/item';
import { Vendor } from 'src/app/models/vendor/vendor';
import { ItemService } from 'src/app/services/item/item.service';
import { VendorService } from 'src/app/services/vendor/vendor.service';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css'],
})
export class InvoiceDetailComponent implements OnInit, OnDestroy {
  @Input() invoiceDetails!: FormArray;
  @Input() totalItemAmount!: AbstractControl<number>;

  destroy$: Subject<void> = new Subject<void>();
  totalAmount: number = 0;
  calculatingTotal: boolean = false;

  dropdownItems$: Observable<Item[]>;
  dropdownVendors$: Observable<Vendor[]>;

  constructor(
    public itemService: ItemService,
    public vendorService: VendorService
  ) {
    this.dropdownItems$ = itemService.dropdownItems$;
    itemService.dropdownSearch$.next('');
    this.dropdownVendors$ = vendorService.dropdownVendors$;
    vendorService.dropdownSearch$.next('');
  }

  ngOnInit(): void {
    this.calculateTotalAmount();

    this.invoiceDetails.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.calculatingTotal) {
          this.calculateTotalAmount();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get invoiceDetailForms(): FormGroup[] {
    return this.invoiceDetails.controls as FormGroup[];
  }

  removeInvoiceDetail(index: number): void {
    this.invoiceDetails.removeAt(index);
  }

  calculateTotalAmount(): void {
    this.calculatingTotal = true;

    this.totalItemAmount.setValue(
      this.invoiceDetails.controls.reduce((sum, invoiceDetail) => {
        const weight =
          Number((invoiceDetail.get('weight') as FormControl).value) || 0;
        const unitPrice =
          Number((invoiceDetail.get('unitPrice') as FormControl).value) || 0;
        const laborFee =
          Number((invoiceDetail.get('laborFee') as FormControl).value) || 0;
        const generalFee =
          Number((invoiceDetail.get('generalFee') as FormControl).value) || 0;
        const totalPrice = weight * unitPrice + laborFee + generalFee;

        invoiceDetail.get('totalPrice')?.setValue(Math.round(totalPrice));
        return sum + totalPrice;
      }, 0)
    );

    this.calculatingTotal = false;
  }
}
