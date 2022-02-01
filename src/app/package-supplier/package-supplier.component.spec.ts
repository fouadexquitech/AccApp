import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageSupplierComponent } from './package-supplier.component';

describe('PackageSupplierComponent', () => {
  let component: PackageSupplierComponent;
  let fixture: ComponentFixture<PackageSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageSupplierComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
