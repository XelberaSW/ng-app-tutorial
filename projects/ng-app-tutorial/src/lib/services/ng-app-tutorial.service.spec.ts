import { TestBed } from '@angular/core/testing';

import { NgAppTutorialService } from './ng-app-tutorial.service';

describe('NgAppTutorialService', () => {
  let service: NgAppTutorialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgAppTutorialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
