import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StoreListComponent } from './store-list/store-list.component';
import { StockItemListComponent } from './stock-item-list/stock-item-list.component';
import { StoreDetailComponent } from './store-detail/store-detail.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'stores'
  },
  {
    path: 'stores',
    component: StoreListComponent,
    data: {
      title: 'သိုလှောင်ရုံများ စာရင်း'
    }
  },
  {
    path: 'item',
    component: StockItemListComponent,
    data: {
      title: 'လှောင်ကုန်များ စာရင်း'
    }
  },
  {
    path: ':id',
    component: StoreDetailComponent,
    data: {
      title: 'လှောင်ကုန်အသေးစိတ် အချက်အလက်',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreRoutingModule { }
