import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, catchError, debounceTime, finalize, map, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { SortColumn, SortDirection } from 'src/app/directives/sortable/sortable.directive';
import { User } from 'src/app/models/user';
import { environment } from 'src/environments/environment';

interface SearchResult {
  users: User[];
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
  providedIn: 'root'
})
export class UserService {
  

  private _listLoading$ = new BehaviorSubject<boolean>(false);
  private _createLoading$ = new BehaviorSubject<boolean>(false);
  private _listSearch$ = new Subject<void>();
  private _listUsers$ = new BehaviorSubject<User[]>([]);

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
        this._listUsers$.next(result.users);
        this._total$.next(result.total);
      });
  }

  get users$() {
    return this._listUsers$.asObservable();
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

  set page(page: number) {
    this._setListState({ page });
  }

  set limit(limit: number) {
    this._setListState({ limit });
  }

  set searchList(searchList: string) {
    this._setListState({ searchList });
  }

  set sortColumn(sortColumn: SortColumn) {
    this._setListState({ sortColumn });
  }

  set sortDirection(sortDirection: SortDirection) {
    this._setListState({ sortDirection });
  }

  private _setListState(patch: Partial<ListState>) {
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
        .append('direction', this._listListState.sortDirection),
    };

    return this.http.get<any>(`api/v1/user`, options).pipe(
      catchError(this.handleError),
      shareReplay(1),
      map((res) => {
        return { users: res?.data, total: res?.totalCounts };
      })
    );
  }

  createUser(user: User): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http.post<any>(`api/v1/user`, user, httpOptions).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
        this._createLoading$.next(false);
      })
    );
  }


  updateUser(userId: number, user: User): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    this._createLoading$.next(true);

    return this.http.put<any>(`api/v1/user/${userId}`, user, httpOptions).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
        this._createLoading$.next(false);
      })
    );
  }

  updateStatus(userId: number, user: User): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this.http.patch<any>(`api/v1/user/${userId}/status`, user, httpOptions).pipe(
      catchError(this.handleError),
    );
  }

  updatePassword(userId: number, user: User): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };

    return this.http.patch<any>(`api/v1/user/${userId}/password`, user, httpOptions).pipe(
      catchError(this.handleError),
    );
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`api/v1/user/${userId}`).pipe(
      catchError(this.handleError),
      finalize(() => {
        this._listSearch$.next();
      })
    );
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => error);
  }

  patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control) {
        // if control is empty return no error
        return null;
      }
      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);
      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? null : error;
    };
  }

  passwordMatchValidator = (control: AbstractControl): ValidatorFn | null => {
    let password = control.get('password')?.value;
    let confirmPassword = control.get('confirmPassword')?.value;
    // compare the password and if they don't match return the error
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ noPasswordMatch: true });
    }

    return null;
  };
}
