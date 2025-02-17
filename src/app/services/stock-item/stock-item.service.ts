import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subject, catchError, debounceTime, finalize, map, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { SortColumn, SortDirection } from 'src/app/directives/sortable/sortable.directive';
import { StockItem } from 'src/app/models/stock-item';
import { DateRangeService } from '../date-range/date-range.service';
import { environment } from 'src/environments/environment';
import { downloadFile } from 'src/app/core/utils/download-file';

interface SearchResult {
  stockItems: StockItem[];
  total: number;
}

interface ListState {
  page: number;
  limit: number;
  searchList: string;
  storeId: number | null;
  fromDate: NgbDate;
  toDate: NgbDate;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

@Injectable({
  providedIn: 'root'
})
export class StockItemService {
  private apiUrl = environment.apiUrl;

  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _createLoading$ = new BehaviorSubject<boolean>(false);
  private _listSearch$ = new Subject<void>();
  private _stockItems$ = new BehaviorSubject<StockItem[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _listState: ListState = {
    page: 1,
    limit: 15,
    searchList: '',
    storeId: null,
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
        this._stockItems$.next(result.stockItems);
        this._total$.next(result.total);
      });
  }

  get stockItems$() {
    return this._stockItems$.asObservable();
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
    return this._listState.page;
  }

  get limit() {
    return this._listState.limit;
  }

  get searchList() {
    return this._listState.searchList;
  }

  get storeId(): number | null {
    return this._listState.storeId;
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

  set storeId(storeId: number | null) {
    this._set({ storeId });
  }

  set fromDate(fromDate: NgbDate | null) {
    if (!fromDate) return;
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
        .append('storeId', this._listState.storeId || '')
        .append('fromDate', this.formatter.format(this._listState.fromDate))
        .append('toDate', this.formatter.format(this._listState.toDate))
        .append('page', this._listState.page)
        .append('limit', this._listState.limit)
        .append('column', this._listState.sortColumn)
        .append('direction', this._listState.sortDirection),
    };

    return this.http.get<any>(`api/v1/store/stock-item`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return { stockItems: res?.data, total: res?.totalCounts };
      })
    );
  }

  createStockItem(stockItem: StockItem): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http.post<any>(`api/v1/store/stock-item`, stockItem, httpOptions).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
        this._createLoading$.next(false);
      })
    );
  }

  updateStockItem(stockItemId: number, stockItem: StockItem): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http
      .put<any>(`api/v1/store/stock-item/${stockItemId}`, stockItem, httpOptions)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
          this._createLoading$.next(false);
        })
      );
  }

  deleteStockItem(stockItemId: number): Observable<any> {
    return this.http.delete<any>(`api/v1/store/stock-item/${stockItemId}`).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
      })
    );
  }

  exportStockItem() {
    const params = new HttpParams()
      .set('search', this._listState.searchList)
      .append('fromDate', this.formatter.format(this._listState.fromDate))
      .append('toDate', this.formatter.format(this._listState.toDate))
      .append('column', this._listState.sortColumn)
      .append('direction', this._listState.sortDirection);

    return this.http
      .get(`api/v1/store/stock-item/export`, {
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
