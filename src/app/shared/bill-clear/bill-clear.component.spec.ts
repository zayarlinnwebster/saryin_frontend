import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillClearComponent } from './bill-clear.component';

describe('BillClearComponent', () => {
  let component: BillClearComponent;
  let fixture: ComponentFixture<BillClearComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BillClearComponent]
    });
    fixture = TestBed.createComponent(BillClearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
