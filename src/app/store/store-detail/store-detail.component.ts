import { Component } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { EMPTY, Observable, Subject, map, switchMap } from 'rxjs';
import { Store } from 'src/app/models/store';
import { StoreUsage } from 'src/app/models/store/store-usage';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { StoreDetailService } from 'src/app/services/store-detail/store-detail.service';
import { StoreService } from 'src/app/services/store/store.service';

@Component({
  selector: 'app-store-detail',
  templateUrl: './store-detail.component.html',
  styleUrls: ['./store-detail.component.css']
})
export class StoreDetailComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
  store$: Observable<Store>;
  storeUsage$: Observable<StoreUsage>;

  activeFragment$: Observable<string>;

  constructor(
    public route: ActivatedRoute,
    private _storeService: StoreService,
    public dateRangeService: DateRangeService,
    public storeDetailService: StoreDetailService
  ) {
    this.dateRangeService.fromDate = storeDetailService.fromDate;
    this.dateRangeService.toDate = storeDetailService.toDate
      ;

    this.activeFragment$ = this.route.fragment.pipe(
      map(fragment => fragment ? decodeURIComponent(fragment) : '')
    );

    this.store$ = this.route.paramMap.pipe(
      switchMap((param: ParamMap) => {
        const customerId = param.get('id');
        if (!customerId) return EMPTY;
        this.storeDetailService.id = Number(customerId);
        return this._storeService.getStore(Number(param.get('id')));
      })
    );

    this.storeUsage$ = this.storeDetailService.storeUsage;
  }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
