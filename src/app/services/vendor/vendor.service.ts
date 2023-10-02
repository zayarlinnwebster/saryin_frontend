import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, debounceTime, finalize, map, shareReplay, switchMap, tap, throwError } from 'rxjs';
import {
  SortColumn,
  SortDirection,
} from 'src/app/directives/sortable/sortable.directive';
import { Vendor } from 'src/app/models/vendor/vendor';
import { environment } from 'src/environments/environment';

interface SearchResult {
  vendors: Vendor[];
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
export class VendorService {
  private apiUrl = environment.apiUrl;

  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _dropdownLoading$ = new BehaviorSubject<boolean>(false);
  private _createLoading$ = new BehaviorSubject<boolean>(false);

  private _listSearch$ = new Subject<void>();
  private _dropdownSearch$ = new Subject<string>();

  private _listVendors$ = new BehaviorSubject<Vendor[]>([]);
  private _dropdownVendors$ = new BehaviorSubject<Vendor[]>([]);

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
        this._listVendors$.next(result.vendors);
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
        this._dropdownVendors$.next(result);
      });
  }

  get vendors$() {
    return this._listVendors$.asObservable();
  }

  get dropdownSearch$() {
    return this._dropdownSearch$;
  }

  get dropdownVendors$() {
    return this._dropdownVendors$.asObservable();
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

  get dropdownLoading$(): Observable<boolean> {
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

    return this.http.get<any>(`api/v1/vendor`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return { vendors: res?.data, total: res?.totalCounts };
      })
    );
  }

  private _dropdownSearch(search: string): Observable<[]> {
    const options = {
      params: new HttpParams().set('search', search).append('limit', 100),
    };

    return this.http.get<any>(`api/v1/dropdown/vendor`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => res.data)
    );
  }

  createVendor(vendor: Vendor): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http.post<any>(`api/v1/vendor`, vendor, httpOptions).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
        this._createLoading$.next(false);
      })
    );
  }

  updateVendor(vendorId: number, vendor: Vendor): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http
      .put<any>(`api/v1/vendor/${vendorId}`, vendor, httpOptions)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
          this._createLoading$.next(false);
        })
      );
  }

  deleteVendor(vendorId: number): Observable<any> {
    return this.http.delete<any>(`api/v1/vendor/${vendorId}`).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
      })
    );
  }

  getVendor(vendorId: number): Observable<any> {
    return this.http.get<any>(`api/v1/vendor/${vendorId}`).pipe(
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
