import { TestBed, inject } from '@angular/core/testing';

import { IdPartService } from './id-part.service';

describe('IdPartService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IdPartService]
    });
  });

  it('should be created', inject([IdPartService], (service: IdPartService) => {
    expect(service).toBeTruthy();
  }));
});
