import { TestBed } from '@angular/core/testing';

import { ManagementUsersService } from './management-users.service';

describe('ManagementUsersService', () => {
  let service: ManagementUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagementUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
