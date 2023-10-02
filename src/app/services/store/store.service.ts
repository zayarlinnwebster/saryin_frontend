import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
import { Store } from 'src/app/models/store';
import { environment } from 'src/environments/environment';

interface SearchResult {
  stores: Store[];
  total: number;
}

interface ListState {
  page: number;
  limit: number;
  searchList: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private apiUrl = environment.apiUrl;

  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _dropdownLoading$ = new BehaviorSubject<boolean>(false);
  private _createLoading$ = new BehaviorSubject<boolean>(false);

  private _listSearch$ = new Subject<void>();
  private _dropdownSearch$ = new Subject<string>();

  private _listStores$ = new BehaviorSubject<Store[]>([]);
  private _dropdownStores$ = new BehaviorSubject<Store[]>([]);

  private _total$ = new BehaviorSubject<number>(0);

  private _listListState: ListState = {
    page: 1,
    limit: 15,
    searchList: '',
    sortColumn: '',
    sortDirection: '',
  };

  constructor(private http: HttpClient) {
    this._listSearch$
      .pipe(
        tap(() => this._listLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        tap(() => this._listLoading$.next(false))
      )
      .subscribe((result) => {
        this._listStores$.next(result.stores);
        this._total$.next(result.total);
      });

      this._dropdownSearch$
      .pipe(
        tap(() => this._dropdownLoading$.next(true)),
        debounceTime(200),
        switchMap((search) => this._dropdownSearch(search)),
        tap(() => this._dropdownLoading$.next(false))
      )
      .subscribe((result) => {
        this._dropdownStores$.next(result);
      });
  }

  get stores$() {
    return this._listStores$.asObservable();
  }

  get dropdownSearch$() {
    return this._dropdownSearch$;
  }

  get dropdownStores$() {
    return this._dropdownStores$.asObservable();
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

  get dropdownLoading$() {
    return this._dropdownLoading$.asObservable();
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

  set page(page: number) {
    this._set({ page });
  }

  set limit(limit: number) {
    this._set({ limit });
  }

  set searchList(searchList: string) {
    this._set({ searchList });
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
        .append('page', this._listListState.page)
        .append('limit', this._listListState.limit)
        .append('column', this._listListState.sortColumn)
        .append('direction', this._listListState.sortDirection)
    };

    return this.http.get<any>(`api/v1/store`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return { stores: res?.data, total: res?.totalCounts };
      })
    );
  }

  private _dropdownSearch(search: string): Observable<[]> {
    const options = {
      params: new HttpParams().set('search', search).append('limit', 30),
    };

    return this.http.get<any>(`api/v1/dropdown/store`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => res.data)
    );
  }

  createStore(store: Store): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http.post<any>(`api/v1/store`, store, httpOptions).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
        this._createLoading$.next(false);
      })
    );
  }

  updateStore(storeId: number, store: Store): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http
      .put<any>(`api/v1/store/${storeId}`, store, httpOptions)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
          this._createLoading$.next(false);
        })
      );
  }

  deleteStore(storeId: number): Observable<any> {
    return this.http.delete<any>(`api/v1/store/${storeId}`).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
      })
    );
  }

  getStore(customerId: number): Observable<any> {
    return this.http.get<any>(`api/v1/store/${customerId}`).pipe(
      shareReplay(1),
      catchError(this.handleError),
      map((res) => res.data)
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }
}
