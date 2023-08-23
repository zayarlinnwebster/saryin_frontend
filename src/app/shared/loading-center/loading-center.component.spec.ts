import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingCenterComponent } from './loading-center.component';

describe('LoadingCenterComponent', () => {
  let component: LoadingCenterComponent;
  let fixture: ComponentFixture<LoadingCenterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingCenterComponent]
    });
    fixture = TestBed.createComponent(LoadingCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
