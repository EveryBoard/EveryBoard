import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuartoComponent } from './quarto.component';

describe('QuartoComponent', () => {
  let component: QuartoComponent;
  let fixture: ComponentFixture<QuartoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuartoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuartoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
