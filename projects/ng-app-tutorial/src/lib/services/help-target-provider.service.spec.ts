import { TestBed } from '@angular/core/testing';

import { HelpTargetProviderService } from './help-target-provider.service';

describe('HelpTargetProviderService', () => {
  let service: HelpTargetProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HelpTargetProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
