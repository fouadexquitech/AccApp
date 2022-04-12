import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageGroupsComponent } from './package-groups.component';

describe('PackageGroupsComponent', () => {
  let component: PackageGroupsComponent;
  let fixture: ComponentFixture<PackageGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackageGroupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PackageGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
