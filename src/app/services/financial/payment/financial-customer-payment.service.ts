import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
import { CustomerPayment } from 'src/app/models/customer/customer-payment';

interface SearchResult {
  customerPayments: CustomerPayment[];
  total: number;
  totalAmount: any;
}

interface ListState {
  page: number;
  limit: number;
  searchList: string;
  financialStatementId: number;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

@Injectable({
  providedIn: 'root',
})
export class FinancialCustomerPaymentService {
  private apiUrl = environment.apiUrl;

  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _createLoading$ = new BehaviorSubject<boolean>(false);
  private _listSearch$ = new Subject<void>();
  private _customerPayments$ = new BehaviorSubject<CustomerPayment[]>([]);
  private _total$ = new BehaviorSubject<number>(0);
  private _totalAmount$ = new BehaviorSubject<any>(null);

  private _listState: ListState = {
    page: 1,
    limit: 15,
    searchList: '',
    financialStatementId: 0,
    sortColumn: '',
    sortDirection: '',
  };

  constructor(
    private http: HttpClient,
  ) {
    this._listSearch$
      .pipe(
        tap(() => this._listLoading$.next(true)),
        switchMap(() => this._search()),
        tap(() => this._listLoading$.next(false))
      )
      .subscribe((result) => {
        console.log(result);

        this._customerPayments$.next(result.customerPayments);
        this._total$.next(result.total);
        this._totalAmount$.next(result.totalAmount);
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
    return this._listState.page;
  }

  get limit() {
    return this._listState.limit;
  }

  get financialStatementId() {
    return this._listState.financialStatementId;
  }

  set page(page: number) {
    this._set({ page });
  }

  set limit(limit: number) {
    this._set({ limit });
  }

  set financialStatementId(financialStatementId: number) {
    this._set({ financialStatementId });
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
        .set('page', this._listState.page)
        .append('limit', this._listState.limit)
        .append('column', this._listState.sortColumn)
        .append('direction', this._listState.sortDirection),
    };

    return this.http.get<any>(`api/v1/financial-statement/${this.financialStatementId}/customer-payment`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return {
          customerPayments: res?.data,
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
