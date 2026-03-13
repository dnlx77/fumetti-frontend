import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfermaDialog } from './conferma-dialog';

describe('ConfermaDialog', () => {
  let component: ConfermaDialog;
  let fixture: ComponentFixture<ConfermaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfermaDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfermaDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
