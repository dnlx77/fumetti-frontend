import { TestBed } from '@angular/core/testing';

import { Storia } from './storia';

describe('Storia', () => {
  let service: Storia;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Storia);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
