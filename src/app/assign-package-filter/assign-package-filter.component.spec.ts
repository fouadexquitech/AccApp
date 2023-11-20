import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignPackageFilterComponent } from './assign-package-filter.component';

describe('AssignPackageFilterComponent', () => {
  let component: AssignPackageFilterComponent;
  let fixture: ComponentFixture<AssignPackageFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignPackageFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignPackageFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
