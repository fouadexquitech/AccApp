import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageComparisonComponent } from './package-comparison.component';

describe('PackageComparisonComponent', () => {
  let component: PackageComparisonComponent;
  let fixture: ComponentFixture<PackageComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageComparisonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
