import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './layout/admin/admin.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'အကောင့်ဝင်ပါ။',
    }
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboards',
        pathMatch: 'full',
      },
      {
        path: 'dashboards',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then(
            (module) => module.DashboardModule
          ),
        data: {
          title: 'ဒက်ရှ်ဘုတ်',
        },
      },
      {
        path: 'vendor',
        loadChildren: () =>
          import('./vendor/vendor.module').then(
            (module) => module.VendorModule
          ),
        data: {
          title: 'ပွဲရုံ',
        },
      },
      {
        path: 'customer',
        loadChildren: () =>
          import('./customer/customer.module').then(
            (module) => module.CustomerModule
          ),
        data: {
          title: 'ကုန်သည်',
        },
      },
      {
        path: 'store',
        loadChildren: () =>
          import('./store/store.module').then((module) => module.StoreModule),
        data: {
          title: 'သိုလှောင်ရုံ',
        },
      },
      {
        path: 'items',
        loadChildren: () =>
          import('./item/item.module').then((module) => module.ItemModule),
        data: {
          title: 'ငါးအမယ်များ',
        },
      },
      {
        path: 'invoices',
        loadChildren: () =>
          import('./invoice/invoice.module').then(
            (module) => module.InvoiceModule
          ),
        data: {
          title: 'နယ်ပို့စာရင်းများ',
        },
      },
      {
        path: 'financial-statements',
        loadChildren: () =>
          import('./financial/financial.module').then(
            (module) => module.FinancialModule
          ),
        data: {
          title: 'နှစ်ချုပ်စာရင်းများ',
        },
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./user/user.module').then(
            (module) => module.UserModule
          ),
        data: {
          title: 'အသုံးပြုသူများ',
        },
      },
    ],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'dashboards'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
