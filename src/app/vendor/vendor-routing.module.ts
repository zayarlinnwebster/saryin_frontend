import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorListComponent } from './vendor-list/vendor-list.component';
import { PaymentListComponent } from './payment-list/payment-list.component';
import { VendorDetailComponent } from './vendor-detail/vendor-detail.component';
import { VendorPaymentComponent } from './vendor-detail/vendor-payment/vendor-payment.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'vendors',
  },
  {
    path: 'vendors',
    component: VendorListComponent,
    data: {
      title: 'ပွဲရုံများ စာရင်း',
    },
  },
  {
    path: 'payments',
    component: PaymentListComponent,
    data: {
      title: 'ပွဲရုံ သွင်းငွေများ',
    },
  },
  {
    path: ':id',
    component: VendorDetailComponent,
    data: {
      title: 'ပွဲရုံအသေးစိတ် အချက်အလက်',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VendorRoutingModule {}
