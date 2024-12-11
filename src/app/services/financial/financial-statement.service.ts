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
import { DateRangeService } from '../date-range/date-range.service';
import { environment } from 'src/environments/environment';
import { downloadFile } from 'src/app/core/utils/download-file';
import { FinancialStatement } from 'src/app/models/financial/financial-statement';

interface SearchResult {
  financialStatements: FinancialStatement[];
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
export class FinancialStatementService {
  private apiUrl = environment.apiUrl;

  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _createLoading$ = new BehaviorSubject<boolean>(false);
  private _dropdownLoading$ = new BehaviorSubject<boolean>(false);

  private _listSearch$ = new Subject<void>();
  private _customerId$ = new Subject<number>();

  private _financialStatements$ = new BehaviorSubject<FinancialStatement[]>([]);
  private _dropdownFinancialStatements$ = new BehaviorSubject<FinancialStatement[]>([]);

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
        this._financialStatements$.next(result.financialStatements);
        this._total$.next(result.total);
        this._totalAmount$.next(result.totalAmount);
      });

    this._customerId$
      .pipe(
        tap(() => this._dropdownLoading$.next(true)),
        switchMap((customerId) => this._dropdown(customerId)),
        tap(() => this._dropdownLoading$.next(false))
      )
      .subscribe((result) => {
        this._dropdownFinancialStatements$.next(result);
      });
  }

  get customerId$() {
    return this._customerId$;
  }

  get dropdownFinancialStatements$() {
    return this._dropdownFinancialStatements$.asObservable();
  }

  get financialStatements$() {
    return this._financialStatements$.asObservable();
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

  get dropdownLoading$() {
    return this._dropdownLoading$.asObservable();
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
    if (!fromDate) {
      return; // Exit early if fromDate is null
    }

    // Update state only if toDate is already set
    if (this.toDate) {
      this._set({ fromDate });
    }

    // Always update the internal list state
    this._listState.fromDate = fromDate;
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

    return this.http.get<any>(`api/v1/financial-statement`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return {
          financialStatements: res?.data,
          total: res?.totalCounts,
          totalAmount: res?.totalAmount,
        };
      })
    );
  }

  getFinancialStatement(financialStatementId: number): Observable<FinancialStatement> {
    return this.http.get<any>(`api/v1/financial-statement/${financialStatementId}`).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return res?.data
      }),
    );
  }

  exportFinancialStatement() {
    const params = new HttpParams()
      .set('search', this._listState.searchList)
      .append('fromDate', this.formatter.format(this._listState.fromDate))
      .append('toDate', this.formatter.format(this._listState.toDate))
      .append('column', this._listState.sortColumn)
      .append('direction', this._listState.sortDirection);

    return this.http
      .get(`api/v1/financial-statement/export`, {
        params: params,
        observe: 'response',
        responseType: 'blob',
      })
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (res) => downloadFile(res),
      });
  }

  private _dropdown(customerId: number): Observable<[]> {
    const options = {
      params: new HttpParams().set('customerId', customerId).append('limit', 100),
    };

    return this.http.get<any>(`api/v1/dropdown/financial-statement`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => res.data)
    );
  }

  createFinancialStatement(financialStatement: FinancialStatement): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http.post<any>(`api/v1/financial-statement`, financialStatement, httpOptions).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
        this._createLoading$.next(false);
      })
    );
  }

  updateFinancialStatement(invoiceId: number, financialStatement: FinancialStatement): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http
      .put<any>(`api/v1/financial-statement/${invoiceId}`, financialStatement, httpOptions)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
          this._createLoading$.next(false);
        })
      );
  }

  separateFinancialStatement(invoiceId: number, financialStatement: FinancialStatement): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http
      .put<any>(`api/v1/financial-statement/${invoiceId}/separate`, financialStatement, httpOptions)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
          this._createLoading$.next(false);
        })
      );
  }

  deleteFinancialStatement(invoiceId: number): Observable<any> {
    return this.http.delete<any>(`api/v1/financial-statement/${invoiceId}`).pipe(
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
