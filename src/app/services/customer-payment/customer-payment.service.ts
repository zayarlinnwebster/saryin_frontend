import { Injectable } from '@angular/core';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { SortColumn, SortDirection } from '../../directives/sortable/sortable.directive';
import { CustomerPayment } from '../../models/customer/customer-payment';
import { BehaviorSubject, Observable, Subject, catchError, debounceTime, finalize, map, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DateRangeService } from '../date-range/date-range.service';
import { environment } from 'src/environments/environment';
import { downloadFile } from 'src/app/core/utils/download-file';

interface SearchResult {
  totalAmount: any;
  customerPayments: CustomerPayment[];
  total: number;
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
export class CustomerPaymentService {
  private apiUrl = environment.apiUrl;

  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _createLoading$ = new BehaviorSubject<boolean>(false);
  private _listSearch$ = new Subject<void>();
  private _customerPayments$ = new BehaviorSubject<CustomerPayment[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private _totalAmount$ = new BehaviorSubject<any>(null);

  private _listListState: ListState = {
    page: 1,
    limit: 15,
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
        this._customerPayments$.next(result.customerPayments);
        this._total$.next(result.total);
        this._totalAmount$.next(result.totalAmount)
      });
  }

  get customerPayments$() {
    return this._customerPayments$.asObservable();
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

    return this.http.get<any>(`api/v1/customer/payment`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return { customerPayments: res?.data, total: res?.totalCounts, totalAmount: res?.totalAmount };
      })
    );
  }

  exportCustomerPayment() {
    const params = new HttpParams()
      .set('search', this._listListState.searchList)
      .append('fromDate', this.formatter.format(this._listListState.fromDate))
      .append('toDate', this.formatter.format(this._listListState.toDate))
      .append('page', this._listListState.page)
      .append('limit', this._listListState.limit)
      .append('column', this._listListState.sortColumn)
      .append('direction', this._listListState.sortDirection);

    return this.http
      .get(`api/v1/customer/payment/export`, {
        params: params,
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (res) => downloadFile(res),
      });
  }

  createCustomerPayment(invoice: CustomerPayment): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http.post<any>(`api/v1/customer/payment`, invoice, httpOptions).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
        this._createLoading$.next(false);
      })
    );
  }

  updateCustomerPayment(invoiceId: number, invoice: CustomerPayment): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http
      .put<any>(`api/v1/customer/payment/${invoiceId}`, invoice, httpOptions)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
          this._createLoading$.next(false);
        })
      );
  }

  deleteCustomerPayment(invoiceId: number): Observable<any> {
    return this.http.delete<any>(`api/v1/customer/payment/${invoiceId}`).pipe(
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
