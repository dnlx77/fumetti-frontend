import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Storie } from './storie';

describe('Storie', () => {
  let component: Storie;
  let fixture: ComponentFixture<Storie>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Storie],
    }).compileComponents();

    fixture = TestBed.createComponent(Storie);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
