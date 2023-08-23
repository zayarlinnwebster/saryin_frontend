import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingRowComponent } from './loading-row.component';

describe('LoadingRowComponent', () => {
  let component: LoadingRowComponent;
  let fixture: ComponentFixture<LoadingRowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingRowComponent]
    });
    fixture = TestBed.createComponent(LoadingRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
