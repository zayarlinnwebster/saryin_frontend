import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorListComponent } from './vendor-list.component';

describe('VendorListComponent', () => {
  let component: VendorListComponent;
  let fixture: ComponentFixture<VendorListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VendorListComponent]
    });
    fixture = TestBed.createComponent(VendorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
