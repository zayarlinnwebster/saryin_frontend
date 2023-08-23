import { LIMIT_OPTIONS } from './../../shared/constants';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Observable, switchMap, takeUntil } from 'rxjs';
import { SortEvent, SortableDirective } from 'src/app/directives/sortable/sortable.directive';
import { AlertModalService } from 'src/app/services/alert-modal/alert-modal.service';
import { StoreService } from 'src/app/services/store/store.service';
import { AlertModalConfig } from 'src/app/shared/alert-modal/alert-modal.config';
import { StoreComponent } from '../store/store.component';
import { Store } from 'src/app/models/store';

@Component({
  selector: 'app-store-list',
  templateUrl: './store-list.component.html',
  styleUrls: ['./store-list.component.css']
})
export class StoreListComponent {
  limitOptions: object[] = LIMIT_OPTIONS;
  stores$: Observable<Store[]>;
  total$: Observable<number>;

  alertModalConfig: AlertModalConfig = {
    modalTitle: 'သိုလှောင်ရုံနာမည်ပြင်ဆင်ခြင်း။',
    hideFooter: false,
    dismissButtonLabel: 'လုပ်မည်။',
    closeButtonLabel: 'မလုပ်ပါ။',
  };

  @ViewChildren(SortableDirective)
  headers!: QueryList<SortableDirective>;

  constructor(
    public storeService: StoreService,
    private modalService: NgbModal,
    private alertModalService: AlertModalService
  ) {
    this.stores$ = storeService.stores$;
    this.total$ = storeService.total$;
    this.storeService.searchList = ''

    this.alertModalService.setAlertModalConfig(this.alertModalConfig);
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.storeService.sortColumn = column;
    this.storeService.sortDirection = direction;
  }

  openCreateStore() {
    this.modalService.open(StoreComponent, {
      backdrop: 'static',
      animation: true,
    });
  }

  openEditStore(store: Store) {
    const modalRef = this.modalService.open(StoreComponent, {
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.editStore = store;
  }

  deleteStore(storeId: number) {
    this.alertModalConfig.hideFooter = false;
    this.alertModalService.setAlertModalConfig(this.alertModalConfig);

    this.alertModalService.open('ဤသိုလှောင်ရုံအမည်ကို ဖျက်မှာသေချာပါသလား?', 'warning');
    this.alertModalService.onDismiss
      .pipe(
        takeUntil(this.alertModalService.onClose),
        switchMap((action) => {
          if (action === 'dismiss') {
            this.alertModalConfig.hideFooter = true;
            this.alertModalService.setAlertModalConfig(this.alertModalConfig);

            return this.storeService.deleteStore(storeId);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe({
        next: (res) => {
          this.alertModalService.open('သိုလှောင်ရုံနာမည်ဖျက်သိမ်းပြီးပါပြီ။', 'success');
        },
        error: (err) => {
          this.alertModalService.open(err, 'danger');
        },
      });
  }
}
