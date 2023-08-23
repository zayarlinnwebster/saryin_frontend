import { NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreRoutingModule } from './store-routing.module';
import { StoreListComponent } from './store-list/store-list.component';
import { StoreComponent } from './store/store.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SortableDirective } from '../directives/sortable/sortable.directive';
import { StockItemComponent } from './stock-item/stock-item.component';
import { StockItemListComponent } from './stock-item-list/stock-item-list.component';
import { StockItemOutComponent } from './stock-item-out/stock-item-out.component';
import { StoreDetailComponent } from './store-detail/store-detail.component';
import { StoreStockItemComponent } from './store-detail/store-stock-item/store-stock-item.component';
import { StoreItemComponent } from './store-detail/store-item/store-item.component';


@NgModule({
  declarations: [
    StoreListComponent,
    StoreComponent,
    StockItemComponent,
    StockItemListComponent,
    StockItemOutComponent,
    StoreDetailComponent,
    StoreStockItemComponent,
    StoreItemComponent,  
  ],
  imports: [
    CommonModule,
    StoreRoutingModule,
    SharedModule,
    NgbNavModule
  ]
})
export class StoreModule { }
