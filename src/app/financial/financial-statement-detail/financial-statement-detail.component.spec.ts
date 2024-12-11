import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinancialStatementDetailComponent } from './financial-statement-detail.component';

describe('FinancialStatementDetailComponent', () => {
  let component: FinancialStatementDetailComponent;
  let fixture: ComponentFixture<FinancialStatementDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FinancialStatementDetailComponent]
    });
    fixture = TestBed.createComponent(FinancialStatementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
