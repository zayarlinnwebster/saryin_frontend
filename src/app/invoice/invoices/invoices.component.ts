import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.css'],
})
export class InvoicesComponent {
  activeFragment$: Observable<string>;

  constructor(public route: ActivatedRoute) {
    this.activeFragment$ = this.route.fragment.pipe(
      map((fragment) => (fragment ? decodeURIComponent(fragment) : ''))
    );
  }
}
