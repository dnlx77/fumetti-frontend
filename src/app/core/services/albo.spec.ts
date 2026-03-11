import { TestBed } from '@angular/core/testing';

import { Albo } from './albo';

describe('Albo', () => {
  let service: Albo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Albo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
