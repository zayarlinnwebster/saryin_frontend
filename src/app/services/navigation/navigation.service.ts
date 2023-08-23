import { Injectable } from '@angular/core';
import { faFile, faFish, faGauge, faPeopleGroup, faStore, faWarehouse } from '@fortawesome/free-solid-svg-icons';
import { Navigation } from 'src/app/models/navigation';

const NavigationItems: Navigation[] = [
  {
    id: 'dashboards',
    title: 'ဒက်ရှ်ဘုတ်',
    type: 'item',
    icon:  faGauge,
    url: '/dashboards'
  },
  {
    id: 'vendor',
    title: 'ပွဲရုံ',
    type: 'collapse',
    icon: faStore,
    children: [
      {
        id: 'vendors',
        title: 'ပွဲရုံများ',
        type: 'item',
        url: '/vendor/vendors'
      },
      {
        id: 'vendor-payments',
        title: 'ပွဲရုံ သွင်းငွေများ',
        type: 'item',
        url: '/vendor/payments'
      }
    ]  },
  {
    id: 'customer',
    title: 'ကုန်သည်',
    type: 'collapse',
    icon: faPeopleGroup,
    children: [
      {
        id: 'customers',
        title: 'ကုန်သည်များ',
        type: 'item',
        url: '/customer/customers'
      },
      {
        id: 'customer-payments',
        title: 'ကုန်သည် လွှဲငွေများ',
        type: 'item',
        url: '/customer/payments'
      }
    ]
  },
  {
    id: 'store',
    title: 'သိုလှောင်ရုံ',
    type: 'collapse',
    icon: faWarehouse,
    children: [
      {
        id: 'stores',
        title: 'သိုလှောင်ရုံများ',
        type: 'item',
        url: '/store/stores'
      },
      {
        id: 'stores',
        title: 'လှောင်ကုန်များ',
        type: 'item',
        url: '/store/item'
      }
    ]
  },
  {
    id: 'items',
    title: 'ငါးအမယ်များ',
    type: 'item',
    icon: faFish,
    url: '/items',
  },
  {
    id: 'invoices',
    title: 'နယ်ပို့စာရင်းများ',
    type: 'item',
    icon: faFile,
    url: '/invoices',
    fragment: 'စာရင်း'
  },
];

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  constructor() {}

  public getNavigationItems() {
    return NavigationItems;
  }
}
