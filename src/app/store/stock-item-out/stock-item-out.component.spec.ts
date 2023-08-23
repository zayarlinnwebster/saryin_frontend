import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockItemOutComponent } from './stock-item-out.component';

describe('StockItemOutComponent', () => {
  let component: StockItemOutComponent;
  let fixture: ComponentFixture<StockItemOutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StockItemOutComponent]
    });
    fixture = TestBed.createComponent(StockItemOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
