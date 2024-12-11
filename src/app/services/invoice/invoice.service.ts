import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  debounceTime,
  finalize,
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
import { Invoice } from 'src/app/models/invoice/invoice';
import { DateRangeService } from '../date-range/date-range.service';
import { environment } from 'src/environments/environment';
import { downloadFile } from 'src/app/core/utils/download-file';

interface SearchResult {
  invoices: Invoice[];
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
  providedIn: 'root',
})
export class InvoiceService {
  private apiUrl = environment.apiUrl;

  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _createLoading$ = new BehaviorSubject<boolean>(false);
  private _detailListLoading$ = new BehaviorSubject<boolean>(false);
  private _listSearch$ = new Subject<void>();
  private _invoices$ = new BehaviorSubject<Invoice[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private _totalAmount$ = new BehaviorSubject<any>(null);

  private _listState: ListState = {
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
    private dateRangeService: DateRangeService
  ) {
    this._listSearch$
      .pipe(
        tap(() => this._listLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        tap(() => this._listLoading$.next(false))
      )
      .subscribe((result) => {
        console.log(result);

        this._invoices$.next(result.invoices);
        this._total$.next(result.total);
        this._totalAmount$.next(result.totalAmount);
      });
  }

  get invoices$() {
    return this._invoices$.asObservable();
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

  get detailListLoading$() {
    return this._detailListLoading$.asObservable();
  }

  get createLoading$() {
    return this._createLoading$.asObservable();
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
    this._listState.fromDate = fromDate;
  }

  set toDate(toDate: NgbDate | null) {
    console.log(toDate);

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
    Object.assign(this._listState, patch);
    this._listSearch$.next();
  }

  private _search(): Observable<SearchResult> {
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

    return this.http.get<any>(`api/v1/invoice`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return {
          invoices: res?.data,
          total: res?.totalCounts,
          totalAmount: res?.totalAmount,
        };
      })
    );
  }

  getInvoice(invoiceId: number): Observable<Invoice> {
    return this.http.get<any>(`api/v1/invoice/${invoiceId}`).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return res?.data
      }),
    );
  }

  exportInvoice() {
    const params = new HttpParams()
      .set('search', this._listState.searchList)
      .append('fromDate', this.formatter.format(this._listState.fromDate))
      .append('toDate', this.formatter.format(this._listState.toDate))
      .append('column', this._listState.sortColumn)
      .append('direction', this._listState.sortDirection);

    return this.http
      .get(`api/v1/invoice/export`, {
        params: params,
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (res) => downloadFile(res),
      });
  }

  createInvoice(invoice: Invoice): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http.post<any>(`api/v1/invoice`, invoice, httpOptions).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
        this._createLoading$.next(false);
      })
    );
  }

  updateInvoice(invoiceId: number, invoice: Invoice): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http
      .put<any>(`api/v1/invoice/${invoiceId}`, invoice, httpOptions)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
          this._createLoading$.next(false);
        })
      );
  }

  separateInvoice(invoiceId: number, invoice: Invoice): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http
      .put<any>(`api/v1/invoice/${invoiceId}/separate`, invoice, httpOptions)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
          this._createLoading$.next(false);
        })
      );
  }

  deleteInvoice(invoiceId: number): Observable<any> {
    return this.http.delete<any>(`api/v1/invoice/${invoiceId}`).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
      })
    );
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
