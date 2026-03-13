import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoriaFormDialog } from './storia-form-dialog';

describe('StoriaFormDialog', () => {
  let component: StoriaFormDialog;
  let fixture: ComponentFixture<StoriaFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoriaFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(StoriaFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
