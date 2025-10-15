import { TestBed } from '@angular/core/testing';
import { WbsListService } from './wbs-list.service';

describe('WbsListService', () => {
  let service: WbsListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WbsListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
