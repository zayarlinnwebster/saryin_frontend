import { Component, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { SortEvent, SortableDirective } from 'src/app/directives/sortable/sortable.directive';
import { StoreItem } from 'src/app/models/store-item';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { StoreDetailService } from 'src/app/services/store-detail/store-detail.service';

@Component({
  selector: 'app-store-item',
  templateUrl: './store-item.component.html',
  styleUrls: ['./store-item.component.css']
})
export class StoreItemComponent {
  storeItems$: Observable<StoreItem[]>;

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public storeDetailService: StoreDetailService,
    public dateRangeService: DateRangeService,
  ) {
    this.storeItems$ = storeDetailService.storeItems;
    storeDetailService.searchList = '';
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.storeDetailService.sortColumn = column;
    this.storeDetailService.sortDirection = direction;
  }

}
