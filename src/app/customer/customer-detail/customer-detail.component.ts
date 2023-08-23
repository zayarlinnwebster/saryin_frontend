import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { EMPTY, Observable, Subject, map, of, switchMap, takeUntil } from 'rxjs';
import { Customer } from 'src/app/models/customer/customer';
import { CustomerUsage } from 'src/app/models/customer/customer-usage';
import { CustomerDetailService } from 'src/app/services/customer-detail/customer-detail.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css'],
})
export class CustomerDetailComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  customer$: Observable<Customer>;
  customerUsage$: Observable<CustomerUsage>;

  activeFragment$: Observable<string>;

  constructor(
    public route: ActivatedRoute,
    private _customerService: CustomerService,
    public dateRangeService: DateRangeService,
    public customerDetailService: CustomerDetailService
  ) {
    this.dateRangeService.fromDate = customerDetailService.fromDate;
    this.dateRangeService.toDate = customerDetailService.toDate;    

    this.activeFragment$ = this.route.fragment.pipe(
      map(fragment => fragment ? decodeURIComponent(fragment) : '')
    );

    this.customer$ = this.route.paramMap.pipe(
      switchMap((param: ParamMap) => {
        const customerId = param.get('id');
        if (!customerId) return EMPTY;
        this.customerDetailService.id = Number(customerId);
        return this._customerService.getCustomer(Number(param.get('id')));
      })
    );

    this.customerUsage$ = this.customerDetailService.customerUsage;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
