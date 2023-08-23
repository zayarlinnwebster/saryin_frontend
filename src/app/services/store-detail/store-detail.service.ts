import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  debounceTime,
  map,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  SortColumn,
  SortDirection,
} from 'src/app/directives/sortable/sortable.directive';
import { StockItem } from 'src/app/models/stock-item';
import { DateRangeService } from '../date-range/date-range.service';
import { StoreUsage } from 'src/app/modesl/store/store-usage';
import { environment } from 'src/environments/environment';
import { StoreItem } from 'src/app/models/store-item';
import { downloadFile } from 'src/app/core/utils/download-file';

interface StockItemSearchResult {
  stockItems: StockItem[];
  total: number;
}

interface StoreItemSearchResult {
  storeItems: StoreItem[];
}

interface ListState {
  id: number;
  page: number;
  limit: number;
  searchList: string;
  fromDate: NgbDate;
  toDate: NgbDate;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

@Injectable({
  providedIn: 'root',
})
export class StoreDetailService {
  private apiUrl = environment.apiUrl;

  private _stockItemListLoading$ = new BehaviorSubject<boolean>(false);
  private _stockItemListSearch$ = new Subject<void>();
  private _stockItems$ = new BehaviorSubject<StockItem[]>([]);
  private _stockItemTotal$ = new BehaviorSubject<number>(0);

  private _storeItemListLoading$ = new BehaviorSubject<boolean>(false);
  private _storeItemListSearch$ = new Subject<void>();
  private _storeItems$ = new BehaviorSubject<StoreItem[]>([]);

  private _listState: ListState = {
    id: 0,
    page: 1,
    limit: 10,
    searchList: '',
    fromDate: this.dateRangeService.monthFirstDate,
    toDate: this.dateRangeService.monthLastDate,
    sortColumn: '',
    sortDirection: '',
  };

  private _storeUsageSearch$ = new Subject<void>();
  private _storeUsage$ = new BehaviorSubject<StoreUsage>({
    totalQtyIn: 0,
    totalQtyOut: 0,
    totalWeightIn: 0,
    totalWeightOut: 0,
  });

  constructor(
    private http: HttpClient,
    private formatter: NgbDateParserFormatter,
    private dateRangeService: DateRangeService
  ) {
    this._stockItemListSearch$
      .pipe(
        tap(() => this._stockItemListLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._stockItemSearch()),
        tap(() => this._stockItemListLoading$.next(false))
      )
      .subscribe((result) => {
        this._stockItems$.next(result.stockItems);
        this._stockItemTotal$.next(result.total);
      });

      this._storeItemListSearch$
      .pipe(
        tap(() => this._storeItemListLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._storeItemSearch()),
        tap(() => this._storeItemListLoading$.next(false))
      )
      .subscribe((result) => {
        this._storeItems$.next(result.storeItems);
      });

    this._storeUsageSearch$
      .pipe(
        debounceTime(200),
        switchMap(() => this._usageSearch())
      )
      .subscribe((result) => {
        this._storeUsage$.next(result);
      });
  }

  get stockItems() {
    return this._stockItems$.asObservable();
  }

  get stockItemTotal() {
    return this._stockItemTotal$.asObservable();
  }

  get storeItems() {
    return this._storeItems$.asObservable();
  }

  get storeUsage() {
    return this._storeUsage$.asObservable();
  }

  get stockItemListLoading() {
    return this._stockItemListLoading$.asObservable();
  }

  get storeItemListLoading() {
    return this._storeItemListLoading$.asObservable();
  }


  get id() {
    return this._listState.id;
  }

  get page() {
    return this._listState.page;
  }

  get limit() {
    return this._listState.limit;
  }

  get searchList() {
    return this._listState.searchList;
  }

  get fromDate() {
    return this._listState.fromDate;
  }

  get toDate() {
    return this._listState.toDate;
  }

  set id(id: number) {
    this._set({ id });
  }

  set page(page: number) {
    this._set({ page });
  }

  set limit(limit: number) {
    this._set({ limit });
  }

  set sortColumn(sortColumn: SortColumn) {
    this._set({ sortColumn });
  }

  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  set searchList(searchList: string) {
    this._set({ searchList });
  }

  set fromDate(fromDate: NgbDate | null) {
    if (!fromDate) return;
    this._set({ fromDate });
  }

  set toDate(toDate: NgbDate | null) {
    if (!toDate) return;
    this._set({ toDate });
  }

  private _set(patch: Partial<ListState>) {
    Object.assign(this._listState, patch);
    this._stockItemListSearch$.next();
    this._storeItemListSearch$.next();
    this._storeUsageSearch$.next();
  }

  private _stockItemSearch(): Observable<StockItemSearchResult> {
    if (this.id === 0) {
      this.handleError('Store id is invalid.');
    }

    const options = {
      params: new HttpParams()
        .set('search', this._listState.searchList)
        .append('fromDate', this.formatter.format(this._listState.fromDate))
        .append('toDate', this.formatter.format(this._listState.toDate))
        .append('page', this._listState.page)
        .append('limit', this._listState.limit)
        .append('column', this._listState.sortColumn)
        .append('direction', this._listState.sortDirection),
    };

    return this.http
      .get<any>(`api/v1/store/${this.id}/stock-item`, options)
      .pipe(
        catchError(this.handleError),
        shareReplay(1),
        map((res) => {
          return { stockItems: res?.data, total: res?.totalCounts };
        })
      );
  }

  private _storeItemSearch(): Observable<StoreItemSearchResult> {
    if (this.id === 0) {
      this.handleError('Store id is invalid.');
    }

    const options = {
      params: new HttpParams()
        .set('search', this._listState.searchList)
        .append('column', this._listState.sortColumn)
        .append('direction', this._listState.sortDirection),
    };

    return this.http
      .get<any>(`api/v1/store/${this.id}/item`, options)
      .pipe(
        catchError(this.handleError),
        shareReplay(1),
        map((res) => {
          return { storeItems: res?.data };
        })
      );
  }

  private _usageSearch(): Observable<StoreUsage> {
    if (this.id === 0) {
      this.handleError('Store id is invalid.');
    }

    const options = {
      params: new HttpParams()
        .set('search', this._listState.searchList)
        .append('fromDate', this.formatter.format(this._listState.fromDate))
        .append('toDate', this.formatter.format(this._listState.toDate)),
    };

    return this.http
      .get<any>(`api/v1/store/${this.id}/usage`, options)
      .pipe(catchError(this.handleError), shareReplay(1));
  }

  exportStoreDetail() {
    const params = new HttpParams()
      .set('search', this._listState.searchList)
      .append('fromDate', this.formatter.format(this._listState.fromDate))
      .append('toDate', this.formatter.format(this._listState.toDate));

    return this.http
      .get(`api/v1/store/${this.id}/usage/export`, {
        params: params,
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (res) => downloadFile(res),
      });
  }

  onDateSelection(date: NgbDate) {
    if (!this.dateRangeService.fromDate && !this.dateRangeService.toDate) {
      this.dateRangeService.fromDate = date;

      this.fromDate = this.dateRangeService.fromDate;
    } else if (
      this.dateRangeService.fromDate &&
      !this.dateRangeService.toDate &&
      date &&
      date.after(this.dateRangeService.fromDate)
    ) {
      this.dateRangeService.toDate = date;

      this.toDate = this.dateRangeService.toDate;
    } else {
      this.dateRangeService.toDate = null;
      this.dateRangeService.fromDate = date;

      this.fromDate = this.dateRangeService.fromDate;
      this.toDate = date;
    }
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
