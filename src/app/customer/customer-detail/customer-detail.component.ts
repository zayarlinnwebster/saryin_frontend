import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class CustomerDetailComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  customer$: Observable<Customer>;
  customerUsage!: CustomerUsage;

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
        if (!param.get('id')) return EMPTY;

        const customerId = Number(param.get('id'));
        this.customerDetailService.customerId = customerId;

        return this._customerService.getCustomer(customerId);
      })
    );

    this.customerDetailService.customerUsage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((customerUsage: CustomerUsage) => {

        this.customerUsage = customerUsage;
      });

  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
