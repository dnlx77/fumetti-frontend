import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Albi } from './albi';

describe('Albi', () => {
  let component: Albi;
  let fixture: ComponentFixture<Albi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Albi],
    }).compileComponents();

    fixture = TestBed.createComponent(Albi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
