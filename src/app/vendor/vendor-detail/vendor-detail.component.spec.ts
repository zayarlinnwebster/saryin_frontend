import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorDetailComponent } from './vendor-detail.component';

describe('VendorDetailComponent', () => {
  let component: VendorDetailComponent;
  let fixture: ComponentFixture<VendorDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VendorDetailComponent]
    });
    fixture = TestBed.createComponent(VendorDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
