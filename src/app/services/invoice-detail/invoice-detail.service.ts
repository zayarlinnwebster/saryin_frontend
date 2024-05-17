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
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import {
  SortColumn,
  SortDirection,
} from 'src/app/directives/sortable/sortable.directive';
import { DateRangeService } from '../date-range/date-range.service';
import { environment } from 'src/environments/environment';
import { InvoiceDetail } from 'src/app/models/invoice/invoice-detail';
import { downloadFile } from 'src/app/core/utils/download-file';
import { FormControl, FormGroup, Validators } from '@angular/forms';

interface SearchResult {
  invoiceDetails: InvoiceDetail[];
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
export class InvoiceDetailService {
  private apiUrl = environment.apiUrl;

  private _createLoading$ = new BehaviorSubject<boolean>(false);
  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _listSearch$ = new Subject<void>();
  private _invoiceDetails$ = new BehaviorSubject<InvoiceDetail[]>([]);
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
        this._invoiceDetails$.next(result.invoiceDetails);
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

    return this.http.get<any>(`api/v1/invoice/detail`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return {
          invoiceDetails: res?.data,
          total: res?.totalCounts,
          totalAmount: res?.totalAmount,
        };
      })
    );
  }

  exportInvoiceDetail() {
    const params = new HttpParams()
      .set('search', this._listListState.searchList)
      .append('fromDate', this.formatter.format(this._listListState.fromDate))
      .append('toDate', this.formatter.format(this._listListState.toDate))
      .append('column', this._listListState.sortColumn)
      .append('direction', this._listListState.sortDirection);

    return this.http
      .get(`api/v1/invoice-detail/export`, {
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

  updateBillClear(
    invoiceDetailId: number,
    isBillCleared: boolean
  ): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this.http
      .patch<any>(
        `api/v1/invoice/detail/${invoiceDetailId}/bill-clear`,
        { isBillCleared },
        httpOptions
      )
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
        })
      );
  }

  getTotalPrice(
    unitPrice: number = 0,
    weight: number = 0,
    laborFee: number = 0,
    generalFee: number = 0
  ): number {
    const totalPrice = Math.round(
      Number(weight) * Number(unitPrice) + Number(laborFee) + Number(generalFee)
    );

    return totalPrice;
  }

  setupStoreItemValidation(
    isStoreItem: FormControl,
    storeId: FormControl,
    storedDate: FormControl,
    destroy: Subject<void>
  ) {
    isStoreItem.valueChanges
      .pipe(takeUntil(destroy))
      .subscribe((isStoreItemValue) => {
        if (isStoreItemValue) {
          storeId.setValidators(Validators.required);
          storedDate.setValidators(Validators.required);
        } else {
          storeId.clearValidators();
          storedDate.clearValidators();
        }

        storeId.updateValueAndValidity();
        storedDate.updateValueAndValidity();
      });
  }

  updateInvoiceDetail(invoiceDetailId: number, invoiceDetail: InvoiceDetail): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http
      .put<any>(`api/v1/invoice/detail/${invoiceDetailId}`, invoiceDetail, httpOptions)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
          this._createLoading$.next(false);
        })
      );
  }

}
