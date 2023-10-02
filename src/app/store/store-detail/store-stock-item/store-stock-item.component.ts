import {
  Component,
  EventEmitter,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, switchMap, take, takeUntil, tap } from 'rxjs';
import {
  SortEvent,
  SortableDirective,
} from 'src/app/directives/sortable/sortable.directive';
import { StockItem } from 'src/app/models/stock-item';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { DateRangeService } from 'src/app/services/date-range/date-range.service';
import { StoreDetailService } from 'src/app/services/store-detail/store-detail.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';
import { StockItemComponent } from '../../stock-item/stock-item.component';
import { StockItemService } from 'src/app/services/stock-item/stock-item.service';
import { StockItemOutComponent } from '../../stock-item-out/stock-item-out.component';
import { StockItemOut } from 'src/app/models/stock-item-out';
import { StockItemOutService } from 'src/app/services/stock-item-out/stock-item-out.service';

@Component({
  selector: 'app-store-stock-item',
  templateUrl: './store-stock-item.component.html',
  styleUrls: ['./store-stock-item.component.css'],
})
export class StoreStockItemComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  stockItems$: Observable<StockItem[]>;
  total$: Observable<number>;
  isDetailsOpen: boolean[] = [];

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'လှောင်ကုန်စာရင်းပြင်ဆင်ခြင်း။',
    hideFooter: false,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public storeDetailService: StoreDetailService,
    public dateRangeService: DateRangeService,
    private _modalService: NgbModal,
    private _alertModalService: AlertModalService,
    public stockItemService: StockItemService,
    private stockItemOutService: StockItemOutService
  ) {
    this.stockItems$ = storeDetailService.stockItems;
    this.total$ = storeDetailService.stockItemTotal;
    storeDetailService.searchList = '';

    this._alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  toggleDetails(index: number): void {
    this.isDetailsOpen[index] = !this.isDetailsOpen[index];
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

  openEditStockItem(stockItem: StockItem) {
    const modalRef = this._modalService.open(StockItemComponent, {
      backdrop: 'static',
      centered: true,
      animation: true,
    });
    modalRef.componentInstance.editStockItem = stockItem;

    modalRef.componentInstance.isSuccess
      .pipe(take(1))
      .subscribe(() => (this.storeDetailService.searchList = ''));
  }

  deleteStockItem(stockItemId: number) {
    this.alertModalConfig.hideFooter = false;
    this._alertModalService.setAlertModalConfig(this.alertModalConfig);

    this._alertModalService.open(
      'ဤလှောင်ကုန်စာရင်းကို ဖျက်မှာသေချာပါသလား?',
      'warning'
    );
    this._alertModalService.onDismiss
      .pipe(
        takeUntil(this._alertModalService.onClose),
        switchMap((action) => {
          if (action === 'dismiss') {
            this.alertModalConfig.hideFooter = true;
            this._alertModalService.setAlertModalConfig(this.alertModalConfig);

            return this.stockItemService.deleteStockItem(stockItemId);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res) => {
          this._alertModalService.open(
            'လှောင်ကုန်စာရင်းဖျက်သိမ်းပြီးပါပြီ။',
            'success'
          );
          this.storeDetailService.searchList = '';
        },
        error: (err) => {
          this._alertModalService.open(err, 'danger');
        },
      });
  }

  openCreateStockItemOut(stockItem: StockItem) {
    const modalRef = this._modalService.open(StockItemOutComponent, {
      backdrop: 'static',
      centered: true,
      animation: true,
    });
    modalRef.componentInstance.stockItem = stockItem;

    modalRef.componentInstance.isSuccess
      .pipe(take(1))
      .subscribe(() => (this.storeDetailService.searchList = ''));
  }

  openEditStockItemOut(stockItem: StockItem, stockItemOut: StockItemOut) {
    const modalRef = this._modalService.open(StockItemOutComponent, {
      backdrop: 'static',
      centered: true,
      animation: true,
    });
    modalRef.componentInstance.stockItem = stockItem;
    modalRef.componentInstance.editStockItemOut = stockItemOut;

    modalRef.componentInstance.isSuccess
      .pipe(take(1))
      .subscribe(() => (this.storeDetailService.searchList = ''));
  }

  deleteStockItemOut(stockItemOutId: number) {
    this.alertModalConfig.hideFooter = false;
    this._alertModalService.setAlertModalConfig(this.alertModalConfig);

    this._alertModalService.open(
      'ဤလှောင်ကုန်ထုတ်ယူမှုစာရင်းကို ဖျက်မှာသေချာပါသလား?',
      'warning'
    );
    this._alertModalService.onDismiss
      .pipe(
        takeUntil(this._alertModalService.onClose),
        switchMap((action) => {
          if (action === 'dismiss') {
            this.alertModalConfig.hideFooter = true;
            this._alertModalService.setAlertModalConfig(this.alertModalConfig);

            return this.stockItemOutService.deleteStockItemOut(stockItemOutId);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res) => {
          this.stockItemService.searchList = '';
          this._alertModalService.open(
            'လှောင်ကုန်ထုတ်ယူမှုစာရင်းဖျက်သိမ်းပြီးပါပြီ။',
            'success'
          );
          this.storeDetailService.searchList = '';
        },
        error: (err) => {
          this._alertModalService.open(err, 'danger');
        },
      });
  }
}
