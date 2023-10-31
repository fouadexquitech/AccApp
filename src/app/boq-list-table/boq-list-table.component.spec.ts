import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoqListTableComponent } from './boq-list-table.component';

describe('BoqListTableComponent', () => {
  let component: BoqListTableComponent;
  let fixture: ComponentFixture<BoqListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoqListTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoqListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
