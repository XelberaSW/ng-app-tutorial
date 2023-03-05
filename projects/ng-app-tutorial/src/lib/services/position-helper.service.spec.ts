import { TestBed } from '@angular/core/testing';

import { PositionHelperService } from './position-helper.service';

describe('PositionHelperService', () => {
  let service: PositionHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PositionHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
