import { TestBed } from '@angular/core/testing';

import { ModuleInitHookService } from './module-init-hook.service';

describe('ModuleInitHookService', () => {
  let service: ModuleInitHookService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModuleInitHookService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
