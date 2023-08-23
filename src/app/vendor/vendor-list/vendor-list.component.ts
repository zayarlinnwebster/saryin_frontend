import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, switchMap, takeUntil } from 'rxjs';
import { SortEvent, SortableDirective } from 'src/app/directives/sortable/sortable.directive';
import { Vendor } from 'src/app/models/vendor/vendor';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { VendorService } from 'src/app/services/vendor/vendor.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { VendorComponent } from '../vendor/vendor.component';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';

@Component({
  selector: 'app-vendor-list',
  templateUrl: './vendor-list.component.html',
  styleUrls: ['./vendor-list.component.css'],
})
export class VendorListComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  vendors$: Observable<Vendor[]>;
  total$: Observable<number>;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ပွဲရုံနာမည်ပြင်ဆင်ခြင်း။',
    hideFooter: false,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public vendorService: VendorService,
    private modalService: NgbModal,
    private alertModalService: AlertModalService
  ) {
    vendorService.searchList = '';

    this.vendors$ = vendorService.vendors$;
    this.total$ = vendorService.total$;

    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.vendorService.sortColumn = column;
    this.vendorService.sortDirection = direction;
  }

  openCreateVendor() {
    this.modalService.open(VendorComponent, {
      backdrop: 'static',
      animation: true,
    });
  }

  openEditVendor(vendor: Vendor) {
    const modalRef = this.modalService.open(VendorComponent, {
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.editVendor = vendor;
  }

  deleteVendor(vendorId: number) {
    this.alertModalConfig.hideFooter = false;
    this.alertModalService.setAlertModalConfig(this.alertModalConfig);

    this.alertModalService.open('ဤပွဲရုံအမည်ကို ဖျက်မှာသေချာပါသလား?', 'warning');
    this.alertModalService.onDismiss
      .pipe(
        takeUntil(this.alertModalService.onClose),
        switchMap((action) => {
          if (action === 'dismiss') {
            this.alertModalConfig.hideFooter = true;
            this.alertModalService.setAlertModalConfig(this.alertModalConfig);

            return this.vendorService.deleteVendor(vendorId);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res) => {
          this.alertModalService.open(
            'ပွဲရုံနာမည်ဖျက်သိမ်းပြီးပါပြီ။',
            'success'
          );
        },
        error: (err) => {
          this.alertModalService.open(err, 'danger');
        },
      });
  }
}
