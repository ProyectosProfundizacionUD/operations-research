import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimplexTwoFasesComponent } from './simplex-two-fases.component';

describe('SimplexTwoFasesComponent', () => {
  let component: SimplexTwoFasesComponent;
  let fixture: ComponentFixture<SimplexTwoFasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimplexTwoFasesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimplexTwoFasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
