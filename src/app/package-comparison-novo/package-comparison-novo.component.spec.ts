import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageComparisonNovoComponent } from './package-comparison-novo.component';

describe('PackageComparisonNovoComponent', () => {
  let component: PackageComparisonNovoComponent;
  let fixture: ComponentFixture<PackageComparisonNovoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageComparisonNovoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageComparisonNovoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
