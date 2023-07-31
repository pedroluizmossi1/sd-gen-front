import { TestBed } from '@angular/core/testing';

import { SdGenApiService } from './sd-gen-api.service';

describe('SdGenApiService', () => {
  let service: SdGenApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SdGenApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
