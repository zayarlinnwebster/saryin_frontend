import { Component, EventEmitter, Output, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, switchMap, takeUntil } from 'rxjs';
import { SortEvent, SortableDirective } from 'src/app/directives/sortable/sortable.directive';
import { VendorPayment } from 'src/app/models/vendor/vendor-payment';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { VendorDetailService } from 'src/app/services/vendor-detail/vendor-detail.service';
import { VendorPaymentService } from 'src/app/services/vendor-payment/vendor-payment.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';
import { PaymentComponent } from '../../payment/payment.component';

@Component({
  selector: 'app-vendor-payment',
  templateUrl: './vendor-payment.component.html',
  styleUrls: ['./vendor-payment.component.css']
})
export class VendorPaymentComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  payments$: Observable<VendorPayment[]>;
  total$: Observable<number>;
  isDetailsOpen: boolean[] = [];

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ပွဲရုံသွင်းငွေပြင်ဆင်ခြင်း။',
    hideFooter: true,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public vendorDetailService: VendorDetailService,
    public dateRangeService: DateRangeService,
    private _modalService: NgbModal,
    private _alertModalService: AlertModalService,
    public vendorPaymentService: VendorPaymentService,
  ) {
    this.payments$ = vendorDetailService.vendorPayments;
    this.total$ = vendorDetailService.paymentTotal;
    vendorDetailService.searchList = '';

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.vendorDetailService.sortColumn = column;
    this.vendorDetailService.sortDirection = direction;
  }

  toggleDetails(index: number): void {
    this.isDetailsOpen[index] = !this.isDetailsOpen[index];
  }

  openEditVendorPayment(vendorPayment: VendorPayment) {
    const modalRef = this._modalService.open(PaymentComponent, {
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.editVendorPayment = vendorPayment;
  }

  deleteVendorPayment(vendorPaymentId: number) {
    this.alertModalConfig.hideFooter = false;
    this._alertModalService.setAlertModalConfig(this.alertModalConfig);

    this._alertModalService.open(
      'ဤပွဲရုံသွင်းငွေကို ဖျက်မှာသေချာပါသလား?',
      'warning'
    );
    this._alertModalService.onDismiss
      .pipe(
        takeUntil(this._alertModalService.onClose),
        switchMap((action) => {
          if (action === 'dismiss') {
            this.alertModalConfig.hideFooter = true;
            this._alertModalService.setAlertModalConfig(this.alertModalConfig);

            return this.vendorPaymentService.deleteVendorPayment(
              vendorPaymentId
            );
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res) => {
          this._alertModalService.open(
            'ပွဲရုံသွင်းငွေဖျက်သိမ်းပြီးပါပြီ။',
            'success'
          );
        },
        error: (err) => {
          this._alertModalService.open(err, 'danger');
        },
      });
  }
}
