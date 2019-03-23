import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuartoOldComponent } from './quarto-old.component';

describe('QuartoOldComponent', () => {
  let component: QuartoOldComponent;
  let fixture: ComponentFixture<QuartoOldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuartoOldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuartoOldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
