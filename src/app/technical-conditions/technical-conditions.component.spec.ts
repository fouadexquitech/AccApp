import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TechnicalConditionsComponent } from './technical-conditions.component';

describe('TechnicalConditionsComponent', () => {
  let component: TechnicalConditionsComponent;
  let fixture: ComponentFixture<TechnicalConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TechnicalConditionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TechnicalConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
