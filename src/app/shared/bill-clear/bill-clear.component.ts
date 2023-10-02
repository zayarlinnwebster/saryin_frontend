import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { InvoiceDetailService } from 'src/app/services/invoice-detail/invoice-detail.service';

@Component({
  selector: 'app-bill-clear',
  templateUrl: './bill-clear.component.html',
  styleUrls: ['./bill-clear.component.css'],
})
export class BillClearComponent {
  @Input()
  invoiceDetail!: InvoiceDetail;
  @Output() isUpdate = new EventEmitter<void>();

  constructor(
    private _invoiceDetailService: InvoiceDetailService,
    private _alertModalService: AlertModalService
  ) {}

  onBillClear(invoiceDetail: InvoiceDetail) {
    this._invoiceDetailService
      .updateBillClear(invoiceDetail.id, !invoiceDetail.isBillCleared)
      .subscribe({
        next: (res) => {
          this._alertModalService.open(
            invoiceDetail.isBillCleared
              ? 'ငွေရှင်းပြီးကြောင်း ဖျက်သိမ်းပီးပါပြီ။'
              : 'ငွေရှင်းပြီးကြောင်း သတ်မှတ်ပီးပါပြီ။',
            'success'
          );
          this.isUpdate.emit();
        },
        error: (err) => {
          this._alertModalService.open(err, 'danger');
        },
      });
  }
}
