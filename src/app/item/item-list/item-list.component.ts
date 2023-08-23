import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  SortableDirective,
  SortEvent,
} from '../../directives/sortable/sortable.directive';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { EMPTY, Observable, switchMap, take, takeUntil } from 'rxjs';
import { Item } from 'src/app/models/item';
import { ItemService } from 'src/app/services/item/item.service';
import { ItemComponent } from '../item/item.component';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { LIMIT_OPTIONS } from 'src/app/shared/constants';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
})
export class ItemListComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  items$: Observable<Item[]>;
  total$: Observable<number>;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'ငါးနာမည်ပြင်ဆင်ခြင်း။',
    hideFooter: false,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public itemService: ItemService,
    private modalService: NgbModal,
    private alertModalService: AlertModalService
  ) {
    this.items$ = itemService.items$;
    this.total$ = itemService.total$;

    this.itemService.searchList = '';
    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.itemService.sortColumn = column;
    this.itemService.sortDirection = direction;
  }

  openCreateItem() {
    this.modalService.open(ItemComponent, {
      backdrop: 'static',
      animation: true,
    });
  }

  openEditItem(item: Item) {
    const modalRef = this.modalService.open(ItemComponent, {
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.editItem = item;
  }

  deleteItem(itemId: number) {
    this.alertModalConfig.hideFooter = false;
    this.alertModalService.setAlertModalConfig(this.alertModalConfig);

    this.alertModalService.open('ဤငါးအမည်ကို ဖျက်မှာသေချာပါသလား?', 'warning');
    this.alertModalService.onDismiss
      .pipe(
        takeUntil(this.alertModalService.onClose),
        switchMap((action) => {
          if (action === 'dismiss') {
            this.alertModalConfig.hideFooter = true;
            this.alertModalService.setAlertModalConfig(this.alertModalConfig);

            return this.itemService.deleteItem(itemId);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res) => {
          this.alertModalService.open('ငါးနာမည်ဖျက်သိမ်းပြီးပါပြီ။', 'success');
        },
        error: (err) => {
          this.alertModalService.open(err, 'danger');
        },
      });
  }
}
