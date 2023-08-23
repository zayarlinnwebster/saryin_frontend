import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subject, catchError, debounceTime, finalize, map, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { SortColumn, SortDirection } from 'src/app/directives/sortable/sortable.directive';
import { VendorPayment } from 'src/app/models/vendor/vendor-payment';
import { DateRangeService } from '../date-range/date-range.service';
import { environment } from 'src/environments/environment';
import { downloadFile } from 'src/app/core/utils/download-file';

interface SearchResult {
  vendorPayments: VendorPayment[];
  total: number;
  totalAmount: any;
}

interface ListState {
  page: number;
  limit: number;
  searchList: string;
  fromDate: NgbDate;
  toDate: NgbDate;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

@Injectable({
  providedIn: 'root'
})
export class VendorPaymentService {
  private apiUrl = environment.apiUrl;

  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _createLoading$ = new BehaviorSubject<boolean>(false);
  private _listSearch$ = new Subject<void>();
  private _vendorPayments$ = new BehaviorSubject<VendorPayment[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private _totalAmount$ = new BehaviorSubject<any>(null);

  private _listListState: ListState = {
    page: 1,
    limit: 10,
    searchList: '',
    fromDate: this.dateRangeService.monthFirstDate,
    toDate: this.dateRangeService.monthLastDate,
    sortColumn: '',
    sortDirection: '',
  };

  constructor(
    private http: HttpClient,
    private formatter: NgbDateParserFormatter,
    private dateRangeService: DateRangeService,
  ) {
    this._listSearch$
      .pipe(
        tap(() => this._listLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        tap(() => this._listLoading$.next(false))
      )
      .subscribe((result) => {
        this._vendorPayments$.next(result.vendorPayments);
        this._total$.next(result.total);
        this._totalAmount$.next(result.totalAmount)
      });
  }

  get vendorPayments$() {
    return this._vendorPayments$.asObservable();
  }

  get total$() {
    return this._total$.asObservable();
  }

  get totalAmount$() {
    return this._totalAmount$.asObservable();
  }

  get listLoading$() {
    return this._listLoading$.asObservable();
  }

  get createLoading$() {
    return this._createLoading$.asObservable();
  }

  get page() {
    return this._listListState.page;
  }

  get limit() {
    return this._listListState.limit;
  }

  get searchList() {
    return this._listListState.searchList;
  }

  get fromDate() {
    return this._listListState.fromDate;
  }

  get toDate() {
    return this._listListState.toDate;
  }

  set page(page: number) {
    this._set({ page });
  }

  set limit(limit: number) {
    this._set({ limit });
  }

  set searchList(searchList: string) {
    this._set({ searchList });
  }

  set fromDate(fromDate: NgbDate | null) {
    if (!fromDate) return;
    this._listListState.fromDate = fromDate;
  }

  set toDate(toDate: NgbDate | null) {
    if (!toDate) return;
    this._set({ toDate });
  }

  set sortColumn(sortColumn: SortColumn) {
    this._set({ sortColumn });
  }

  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  private _set(patch: Partial<ListState>) {
    Object.assign(this._listListState, patch);
    this._listSearch$.next();
  }

  private _search(): Observable<SearchResult> {
    const options = {
      params: new HttpParams()
        .set('search', this._listListState.searchList)
        .append('fromDate', this.formatter.format(this._listListState.fromDate))
        .append('toDate', this.formatter.format(this._listListState.toDate))
        .append('page', this._listListState.page)
        .append('limit', this._listListState.limit)
        .append('column', this._listListState.sortColumn)
        .append('direction', this._listListState.sortDirection),
    };

    return this.http.get<any>(`api/v1/vendor/payment`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return { vendorPayments: res?.data, total: res?.totalCounts, totalAmount: res?.totalAmount };
      })
    );
  }

  exportVendorPayment() {
    const params = new HttpParams()
      .set('search', this._listListState.searchList)
      .append('fromDate', this.formatter.format(this._listListState.fromDate))
      .append('toDate', this.formatter.format(this._listListState.toDate))
      .append('page', this._listListState.page)
      .append('limit', this._listListState.limit)
      .append('column', this._listListState.sortColumn)
      .append('direction', this._listListState.sortDirection);

    return this.http
      .get(`api/v1/vendor/payment/export`, {
        params: params,
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (res) => downloadFile(res),
      });
  }

  createVendorPayment(invoice: VendorPayment): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http.post<any>(`api/v1/vendor/payment`, invoice, httpOptions).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
        this._createLoading$.next(false);
      })
    );
  }

  updateVendorPayment(invoiceId: number, invoice: VendorPayment): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http
      .put<any>(`api/v1/vendor/payment/${invoiceId}`, invoice, httpOptions)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
          this._createLoading$.next(false);
        })
      );
  }

  deleteVendorPayment(invoiceId: number): Observable<any> {
    return this.http.delete<any>(`api/v1/vendor/payment/${invoiceId}`).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
      })
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
