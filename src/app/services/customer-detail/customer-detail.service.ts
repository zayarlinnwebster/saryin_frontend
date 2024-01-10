import { Injectable } from '@angular/core';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subject, catchError, debounceTime, map, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CustomerPayment } from 'src/app/models/customer/customer-payment';
import { Invoice } from 'src/app/models/invoice/invoice';
import { SortColumn, SortDirection } from 'src/app/directives/sortable/sortable.directive';
import { DateRangeService } from '../date-range/date-range.service';
import { CustomerUsage } from 'src/app/models/customer/customer-usage';
import { environment } from 'src/environments/environment';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';
import { downloadFile } from 'src/app/core/utils/download-file';

interface InvoiceSearchResult {
  customerInvoiceDetails: InvoiceDetail[];
  total: number;
}

interface PaymentSearchResult {
  customerPayments: CustomerPayment[];
  total: number;
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
  providedIn: 'root'
})
export class CustomerDetailService {
  private apiUrl = environment.apiUrl;

  private _invoiceListLoading$ = new BehaviorSubject<boolean>(false);
  private _invoiceListSearch$ = new Subject<void>();
  private _customerInvoiceDetails$ = new BehaviorSubject<InvoiceDetail[]>([]);
  private _invoiceTotal$ = new BehaviorSubject<number>(0);

  private _paymentListLoading$ = new BehaviorSubject<boolean>(false);
  private _paymentListSearch$ = new Subject<void>();
  private _customerPayments$ = new BehaviorSubject<CustomerPayment[]>([]);
  private _paymentTotal$ = new BehaviorSubject<number>(0);

  private _customerUsageSearch$ = new Subject<void>();
  private _customerUsage$ = new BehaviorSubject<CustomerUsage>({ totalCustomerInvoice: 0, totalCustomerPayment: 0, totalItemCount: 0});

  private _listState: ListState = {
    id: 0,
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
    this._invoiceListSearch$
      .pipe(
        tap(() => this._invoiceListLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._invoiceSearch()),
        tap(() => this._invoiceListLoading$.next(false))
      )
      .subscribe((result) => {
        this._customerInvoiceDetails$.next(result.customerInvoiceDetails);
        this._invoiceTotal$.next(result.total);
      });

      this._paymentListSearch$
      .pipe(
        tap(() => this._paymentListLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._paymentSearch()),
        tap(() => this._paymentListLoading$.next(false))
      )
      .subscribe((result) => {
        this._customerPayments$.next(result.customerPayments);
        this._paymentTotal$.next(result.total);
      });

      this._customerUsageSearch$
      .pipe(
        debounceTime(200),
        switchMap(() => this._usageSearch())
      )
      .subscribe((result) => {
        this._customerUsage$.next(result);
      });
  }

  get customerInvoiceDetails() {
    return this._customerInvoiceDetails$.asObservable();
  }

  get invoiceTotal() {
    return this._invoiceTotal$.asObservable();
  }

  get customerPayments() {
    return this._customerPayments$.asObservable();
  }

  get paymentTotal() {
    return this._paymentTotal$.asObservable();
  }

  get customerUsage() {
    return this._customerUsage$.asObservable();
  }

  get invoiceListLoading() {
    return this._invoiceListLoading$.asObservable();
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
    this._invoiceListSearch$.next();
    this._paymentListSearch$.next();
    this._customerUsageSearch$.next();
  }

  private _invoiceSearch(): Observable<InvoiceSearchResult> {
    if (this.id === 0) {      
      this.handleError('Customer id is invalid.')
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

    return this.http.get<any>(`api/v1/customer/${this.id}/invoice-detail`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return { customerInvoiceDetails: res?.data, total: res?.totalCounts };
      })
    );
  }

  private _paymentSearch(): Observable<PaymentSearchResult> {
    if (this.id === 0) {      
      this.handleError('Customer id is invalid.')
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

    return this.http.get<any>(`api/v1/customer/${this.id}/payment`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return { customerPayments: res?.data, total: res?.totalCounts };
      })
    );
  }

  private _usageSearch(): Observable<CustomerUsage> {
    if (this.id === 0) {
      this.handleError('Customer id is invalid.');
    }

    const options = {
      params: new HttpParams()
        .set('search', this._listState.searchList)
        .append('fromDate', this.formatter.format(this._listState.fromDate))
        .append('toDate', this.formatter.format(this._listState.toDate)),
    };

    return this.http
      .get<any>(`api/v1/customer/${this.id}/usage`, options)
      .pipe(
        catchError(this.handleError),
        shareReplay(1),
      );
  }

  exportCustomerDetail() {
    const params = new HttpParams()
      .set('search', this._listState.searchList)
      .append('fromDate', this.formatter.format(this._listState.fromDate))
      .append('toDate', this.formatter.format(this._listState.toDate));

    return this.http
      .get(`api/v1/customer/${this.id}/usage/export`, {
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
