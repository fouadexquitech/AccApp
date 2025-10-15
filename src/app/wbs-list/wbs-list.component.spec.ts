import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WbsListComponent } from './wbs-list.component';

describe('WbsListComponent', () => {
  let component: WbsListComponent;
  let fixture: ComponentFixture<WbsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WbsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WbsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
