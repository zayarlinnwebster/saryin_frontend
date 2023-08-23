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
import { DateRangeService } from '../date-range/date-range.service';
import { environment } from 'src/environments/environment';

interface ItemBarChartResutl {
  labels: string[];
  data: string[];
}

interface ListState {
  fromDate: NgbDate;
  toDate: NgbDate;
  searchList: string;
}

@Injectable({
  providedIn: 'root',
})
export class MainDashboardService {
  private apiUrl = environment.apiUrl;

  private _itemChartLoading$ = new BehaviorSubject<boolean>(false);
  private _itemChartSearch$ = new Subject<void>();
  private _itemChartData$ = new BehaviorSubject<ItemBarChartResutl>({
    data: [],
    labels: [],
  });

  private _vendorPaymentChartLoading$ = new BehaviorSubject<boolean>(false);
  private _vendorPaymentChartSearch$ = new Subject<void>();
  private _vendorPaymentChartData$ = new BehaviorSubject<ItemBarChartResutl>({
    data: [],
    labels: [],
  });

  private _customerPaymentChartLoading$ = new BehaviorSubject<boolean>(false);
  private _customerPaymentChartSearch$ = new Subject<void>();
  private _customerPaymentChartData$ = new BehaviorSubject<ItemBarChartResutl>({
    data: [],
    labels: [],
  });

  private _totalChartLoading$ = new BehaviorSubject<boolean>(false);
  private _totalChartSearch$ = new Subject<void>();
  private _totalChartData$ = new BehaviorSubject<ItemBarChartResutl>({
    data: [],
    labels: [],
  });

  private _amountChartLoading$ = new BehaviorSubject<boolean>(false);
  private _amountChartSearch$ = new Subject<void>();
  private _amountChartData$ = new BehaviorSubject<ItemBarChartResutl>({
    data: [],
    labels: [],
  });

  private _chartState: ListState = {
    searchList: '',
    fromDate: this.dateRangeService.monthFirstDate,
    toDate: this.dateRangeService.monthLastDate,
  };

  constructor(
    private http: HttpClient,
    private formatter: NgbDateParserFormatter,
    private dateRangeService: DateRangeService
  ) {
    this._itemChartSearch$
      .pipe(
        tap(() => this._itemChartLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._searchItemBarChart()),
        tap(() => this._itemChartLoading$.next(false))
      )
      .subscribe((result) => {
        this._itemChartData$.next(result);
      });

    this._vendorPaymentChartSearch$
      .pipe(
        tap(() => this._vendorPaymentChartLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._searchVendorPaymentBarChart()),
        tap(() => this._vendorPaymentChartLoading$.next(false))
      )
      .subscribe((result) => {
        this._vendorPaymentChartData$.next(result);
      });

    this._customerPaymentChartSearch$
      .pipe(
        tap(() => this._customerPaymentChartLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._searchCustomerPaymentBarChart()),
        tap(() => this._customerPaymentChartLoading$.next(false))
      )
      .subscribe((result) => {
        this._customerPaymentChartData$.next(result);
      });

    this._totalChartSearch$
      .pipe(
        tap(() => this._totalChartLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._searchTotalPieChart()),
        tap(() => this._totalChartLoading$.next(false))
      )
      .subscribe((result) => {
        this._totalChartData$.next(result);
      });

    this._amountChartSearch$
      .pipe(
        tap(() => this._amountChartLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._searchAmountLineChart()),
        tap(() => this._amountChartLoading$.next(false))
      )
      .subscribe((result) => {
        this._amountChartData$.next(result);
      });
  }

  get itemChartData$() {
    return this._itemChartData$.asObservable();
  }

  get itemChartLoading$() {
    return this._itemChartLoading$.asObservable();
  }

  get vendorPaymentChartData$() {
    return this._vendorPaymentChartData$.asObservable();
  }

  get vendorPaymentChartLoading$() {
    return this._vendorPaymentChartLoading$.asObservable();
  }

  get customerPaymentChartData$() {
    return this._customerPaymentChartData$.asObservable();
  }

  get customerPaymentChartLoading$() {
    return this._customerPaymentChartLoading$.asObservable();
  }

  get totalChartData$() {
    return this._totalChartData$.asObservable();
  }

  get totalChartLoading$() {
    return this._totalChartLoading$.asObservable();
  }

  get amountChartData$() {
    return this._amountChartData$.asObservable();
  }

  get amountChartLoading$() {
    return this._amountChartLoading$.asObservable();
  }

  get searchList() {
    return this._chartState.searchList;
  }

  get fromDate() {
    return this._chartState.fromDate;
  }

  get toDate() {
    return this._chartState.toDate;
  }

  set searchList(searchList: string) {
    this._setBarChart({ searchList });
  }

  set fromDate(fromDate: NgbDate | null) {
    if (!fromDate) return;
    this._chartState.fromDate = fromDate;
  }

  set toDate(toDate: NgbDate | null) {
    if (!toDate) return;
    this._setBarChart({ toDate });
  }

  private _setBarChart(patch: Partial<ListState>) {
    Object.assign(this._chartState, patch);
    this._itemChartSearch$.next();
    this._customerPaymentChartSearch$.next();
    this._vendorPaymentChartSearch$.next();
    this._totalChartSearch$.next();
    this._amountChartSearch$.next();
  }

  private _searchItemBarChart(): Observable<ItemBarChartResutl> {
    const options = {
      params: new HttpParams()
        .set('search', this._chartState.searchList)
        .append('fromDate', this.formatter.format(this._chartState.fromDate))
        .append('toDate', this.formatter.format(this._chartState.toDate)),
    };

    return this.http
      .get<any>(`api/v1/dashboard/main/item`, options)
      .pipe(catchError(this.handleError), shareReplay(1));
  }

  private _searchCustomerPaymentBarChart(): Observable<ItemBarChartResutl> {
    const options = {
      params: new HttpParams()
        .set('search', this._chartState.searchList)
        .append('fromDate', this.formatter.format(this._chartState.fromDate))
        .append('toDate', this.formatter.format(this._chartState.toDate)),
    };

    return this.http
      .get<any>(`api/v1/dashboard/main/customer-payment`, options)
      .pipe(catchError(this.handleError), shareReplay(1));
  }

  private _searchVendorPaymentBarChart(): Observable<ItemBarChartResutl> {
    const options = {
      params: new HttpParams()
        .set('search', this._chartState.searchList)
        .append('fromDate', this.formatter.format(this._chartState.fromDate))
        .append('toDate', this.formatter.format(this._chartState.toDate)),
    };

    return this.http
      .get<any>(`api/v1/dashboard/main/vendor-payment`, options)
      .pipe(catchError(this.handleError), shareReplay(1));
  }

  private _searchTotalPieChart(): Observable<ItemBarChartResutl> {
    const options = {
      params: new HttpParams()
        .set('fromDate', this.formatter.format(this._chartState.fromDate))
        .append('toDate', this.formatter.format(this._chartState.toDate)),
    };

    return this.http
      .get<any>(`api/v1/dashboard/main/total`, options)
      .pipe(catchError(this.handleError), shareReplay(1));
  }

  private _searchAmountLineChart(): Observable<ItemBarChartResutl> {
    const options = {
      params: new HttpParams()
        .set('fromDate', this.formatter.format(this._chartState.fromDate))
        .append('toDate', this.formatter.format(this._chartState.toDate)),
    };

    return this.http
      .get<any>(`api/v1/dashboard/main/amount`, options)
      .pipe(catchError(this.handleError), shareReplay(1));
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
