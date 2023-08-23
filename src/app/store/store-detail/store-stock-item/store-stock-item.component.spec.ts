import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreStockItemComponent } from './store-stock-item.component';

describe('StoreStockItemComponent', () => {
  let component: StoreStockItemComponent;
  let fixture: ComponentFixture<StoreStockItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StoreStockItemComponent]
    });
    fixture = TestBed.createComponent(StoreStockItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
