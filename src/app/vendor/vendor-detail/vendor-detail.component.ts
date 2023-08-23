import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { EMPTY, Observable, Subject, map, of, switchMap, takeUntil } from 'rxjs';
import { Vendor } from 'src/app/models/vendor/vendor';
import { VendorUsage } from 'src/app/models/vendor/vendor-usage';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { VendorDetailService } from 'src/app/services/vendor-detail/vendor-detail.service';
import { VendorService } from 'src/app/services/vendor/vendor.service';

@Component({
  selector: 'app-vendor-detail',
  templateUrl: './vendor-detail.component.html',
  styleUrls: ['./vendor-detail.component.css'],
})
export class VendorDetailComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  vendor$: Observable<Vendor>;
  vendorUsage$: Observable<VendorUsage>;

  activeFragment$: Observable<string>;

  constructor(
    public route: ActivatedRoute,
    private _vendorService: VendorService,
    public dateRangeService: DateRangeService,
    public vendorDetailService: VendorDetailService,
  ) {
    this.dateRangeService.fromDate = vendorDetailService.fromDate;
    this.dateRangeService.toDate = vendorDetailService.toDate;    

    this.activeFragment$ = this.route.fragment.pipe(
      map(fragment => fragment ? decodeURIComponent(fragment) : '')
    );

    this.vendor$ = this.route.paramMap
      .pipe(
        switchMap((param: ParamMap) => {
          const vendorId = param.get('id');
          if (!vendorId) return EMPTY;

          vendorDetailService.id = Number(vendorId);
          return this._vendorService.getVendor(Number(param.get('id')));
        })
      );

    this.vendorUsage$ = this.vendorDetailService.vendorUsage;
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
