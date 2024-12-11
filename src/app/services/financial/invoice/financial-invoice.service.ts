import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
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
import { environment } from 'src/environments/environment';
import { DateRangeService } from '../../date-range/date-range.service';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';

interface SearchResult {
  customerInvoiceDetails: InvoiceDetail[];
  total: number;
  totalAmount: any;
}

interface ListState {
  page: number;
  limit: number;
  searchList: string;
  customerId: number;
  fromDate: NgbDate;
  toDate: NgbDate;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

@Injectable({
  providedIn: 'root',
})
export class FinancialInvoiceService {
  private apiUrl = environment.apiUrl;

  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _createLoading$ = new BehaviorSubject<boolean>(false);
  private _listSearch$ = new Subject<void>();
  private _invoiceDetails$ = new BehaviorSubject<InvoiceDetail[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private _totalAmount$ = new BehaviorSubject<any>(null);

  private _listState: ListState = {
    page: 1,
    limit: 15,
    searchList: '',
    fromDate: this.dateRangeService.monthFirstDate,
    toDate: this.dateRangeService.monthLastDate,
    customerId: 0,
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
        switchMap(() => this._search()),
        tap(() => this._listLoading$.next(false))
      )
      .subscribe((result) => {
        console.log(result);

        this._invoiceDetails$.next(result.customerInvoiceDetails);
        this._total$.next(result.total);
        this._totalAmount$.next(result.totalAmount);
      });
  }

  get invoiceDetails$() {
    return this._invoiceDetails$.asObservable();
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
    return this._listState.page;
  }

  get limit() {
    return this._listState.limit;
  }

  get customerId() {
    return this._listState.customerId;
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

  set customerId(customerId: number) {
    this._set({ customerId });
  }

  set fromDate(fromDate: NgbDate | null) {
    if (!fromDate) {
      return; // Exit early if fromDate is null
    }

    // Update state only if toDate is already set
    if (this.toDate && this.customerId > 0) {
      this._set({ fromDate });
    }

    // Always update the internal list state
    this._listState.fromDate = fromDate;
  }

  set toDate(toDate: NgbDate | null) {
    if (!toDate || this.customerId === 0) {
      return; // Exit early if `toDate` is null or the `customerId` is invalid
    }

    // Update the internal state with the new `toDate`
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
        .set('fromDate', this.formatter.format(this._listState.fromDate))
        .append('toDate', this.formatter.format(this._listState.toDate))
        .append('page', this._listState.page)
        .append('limit', this._listState.limit)
        .append('column', this._listState.sortColumn)
        .append('direction', this._listState.sortDirection),
    };

    return this.http.get<any>(`api/v1/customer/${this.customerId}/invoice-detail`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return {
          customerInvoiceDetails: res?.data,
          total: res?.totalCounts,
          totalAmount: res?.totalAmount,
        };
      })
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
