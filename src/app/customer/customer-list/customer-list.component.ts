import { LIMIT_OPTIONS } from './../../shared/constants';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, switchMap, takeUntil } from 'rxjs';
import { SortEvent, SortableDirective } from 'src/app/directives/sortable/sortable.directive';
import { Customer } from 'src/app/models/customer/customer';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { CustomerComponent } from '../customer/customer.component';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css'],
})
export class CustomerListComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  customers$: Observable<Customer[]>;
  total$: Observable<number>;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ကုန်သည်နာမည်ပြင်ဆင်ခြင်း။',
    hideFooter: false,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public customerService: CustomerService,
    private modalService: NgbModal,
    private alertModalService: AlertModalService
  ) {
    customerService.searchList = '';

    this.customers$ = customerService.customers$;
    this.total$ = customerService.total$;

    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  onSort({ column, direction }: SortEvent) {
    console.log({ column, direction });

    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.customerService.sortColumn = column;
    this.customerService.sortDirection = direction;
  }

  openCreateCustomer() {
    this.modalService.open(CustomerComponent, {
      backdrop: 'static',
      animation: true,
    });
  }

  openEditCustomer(customer: Customer) {
    const modalRef = this.modalService.open(CustomerComponent, {
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.editCustomer = customer;
  }

  deleteCustomer(customerId: number) {
    this.alertModalConfig.hideFooter = false;
    this.alertModalService.setAlertModalConfig(this.alertModalConfig);

    this.alertModalService.open('ဤကုန်သည်အမည်ကို ဖျက်မှာသေချာပါသလား?', 'warning');
    this.alertModalService.onDismiss
      .pipe(
        takeUntil(this.alertModalService.onClose),
        switchMap((action) => {
          if (action === 'dismiss') {
            this.alertModalConfig.hideFooter = true;
            this.alertModalService.setAlertModalConfig(this.alertModalConfig);

            return this.customerService.deleteCustomer(customerId);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res) => {
          this.alertModalService.open('ကုန်သည်နာမည်ဖျက်သိမ်းပြီးပါပြီ။', 'success');
        },
        error: (err) => {
          this.alertModalService.open(err, 'danger');
        },
      });
  }
}
