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
import { Customer } from 'src/app/models/customer/customer';
import { environment } from 'src/environments/environment';

interface SearchResult {
  customers: Customer[];
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
export class CustomerService {
  private apiUrl = environment.apiUrl;

  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _dropdownLoading$ = new BehaviorSubject<boolean>(false);
  private _createLoading$ = new BehaviorSubject<boolean>(false);

  private _listSearch$ = new Subject<void>();
  private _dropdownSearch$ = new Subject<string>();

  private _listCustomers$ = new BehaviorSubject<Customer[]>([]);
  private _dropdownCustomers$ = new BehaviorSubject<Customer[]>([]);

  private _total$ = new BehaviorSubject<number>(0);

  private _listState: ListState = {
    page: 1,
    limit: 10,
    searchList: '',
    sortColumn: '',
    sortDirection: '',
  };

  constructor(
    private http: HttpClient,
  ) {
    this._listSearch$
      .pipe(
        tap(() => this._listLoading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        tap(() => this._listLoading$.next(false))
      )
      .subscribe((result) => {
        this._listCustomers$.next(result.customers);
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
        this._dropdownCustomers$.next(result);
      });
  }

  get customers$() {
    return this._listCustomers$.asObservable();
  }

  get dropdownSearch$() {
    return this._dropdownSearch$;
  }

  get dropdownCustomers$() {
    return this._dropdownCustomers$.asObservable();
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
    return this._listState.page;
  }

  get limit() {
    return this._listState.limit;
  }

  get searchList() {
    return this._listState.searchList;
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
    Object.assign(this._listState, patch);
    this._listSearch$.next();
  }

  private _search(): Observable<SearchResult> {
    const options = {
      params: new HttpParams()
        .set('search', this._listState.searchList)
        .append('page', this._listState.page)
        .append('limit', this._listState.limit)
        .append('column', this._listState.sortColumn)
        .append('direction', this._listState.sortDirection),
    };

    return this.http.get<any>(`api/v1/customer`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return { customers: res?.data, total: res?.totalCounts };
      })
    );
  }

  private _dropdownSearch(search: string): Observable<[]> {
    const options = {
      params: new HttpParams().set('search', search).append('limit', 100),
    };

    return this.http.get<any>(`api/v1/dropdown/customer`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => res.data)
    );
  }

  createCustomer(customer: Customer): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http.post<any>(`api/v1/customer`, customer, httpOptions).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
        this._createLoading$.next(false);
      })
    );
  }

  updateCustomer(customerId: number, customer: Customer): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http
      .put<any>(`api/v1/customer/${customerId}`, customer, httpOptions)
      .pipe(
        catchError(this.handleError),
        finalize(() => {
          this._listSearch$.next();
          this._createLoading$.next(false);
        })
      );
  }

  deleteCustomer(customerId: number): Observable<any> {
    return this.http.delete<any>(`api/v1/customer/${customerId}`).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
      })
    );
  }

  getCustomer(customerId: number): Observable<any> {
    return this.http.get<any>(`api/v1/customer/${customerId}`).pipe(
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
