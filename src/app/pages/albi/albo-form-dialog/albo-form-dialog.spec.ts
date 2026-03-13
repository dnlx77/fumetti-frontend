import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlboFormDialog } from './albo-form-dialog';

describe('AlboFormDialog', () => {
  let component: AlboFormDialog;
  let fixture: ComponentFixture<AlboFormDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlboFormDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AlboFormDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
