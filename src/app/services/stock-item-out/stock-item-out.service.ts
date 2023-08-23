import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subject, catchError, debounceTime, finalize, map, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { SortColumn, SortDirection } from 'src/app/directives/sortable/sortable.directive';
import { StockItemOut } from 'src/app/models/stock-item-out';
import { DateRangeService } from '../date-range/date-range.service';
import { StockItemService } from '../stock-item/stock-item.service';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { environment } from 'src/environments/environment';

interface SearchResult {
  stockItemOuts: StockItemOut[];
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
export class StockItemOutService {
  private apiUrl = environment.apiUrl;

  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _createLoading$ = new BehaviorSubject<boolean>(false);
  private _listSearch$ = new Subject<void>();
  private _stockItemOuts$ = new BehaviorSubject<StockItemOut[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

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
        this._stockItemOuts$.next(result.stockItemOuts);
        this._total$.next(result.total);
      });
  }

  get stockItemOuts$() {
    return this._stockItemOuts$.asObservable();
  }

  get total$() {
    return this._total$.asObservable();
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

    return this.http.get<any>(`api/v1/store/stock-item-out`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return { stockItemOuts: res?.data, total: res?.totalCounts };
      })
    );
  }

  createStockItemOut(stockItemOut: StockItemOut): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http.post<any>(`api/v1/store/stock-item-out`, stockItemOut, httpOptions).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
        this._createLoading$.next(false);
      })
    );
  }

  updateStockItemOut(stockItemOutId: number, stockItemOut: StockItemOut): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http
      .put<any>(`api/v1/store/stock-item-out/${stockItemOutId}`, stockItemOut, httpOptions)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
          this._createLoading$.next(false);
        })
      );
  }

  deleteStockItemOut(stockItemOutId: number): Observable<any> {
    return this.http.delete<any>(`api/v1/store/stock-item-out/${stockItemOutId}`).pipe(
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
