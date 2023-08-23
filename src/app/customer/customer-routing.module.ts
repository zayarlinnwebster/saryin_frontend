import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { PaymentListComponent } from './payment-list/payment-list.component';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'customers'
  },
  {
    path: 'customers',
    component: CustomerListComponent,
    data: {
      title: 'ကုန်သည်များ စာရင်း'
    }
  },
  {
    path: 'payments',
    component: PaymentListComponent,
    data: {
      title: 'ကုန်သည်လွှဲငွေများ'
    }
  },
  {
    path: ':id',
    component: CustomerDetailComponent,
    data: {
      title: 'ကုန်သည်အသေးစိတ် အချက်အလက်',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }
