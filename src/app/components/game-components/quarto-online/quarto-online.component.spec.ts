import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuartoOnlineComponent } from './quarto-online.component';

describe('QuartoOnlineComponent', () => {
  let component: QuartoOnlineComponent;
  let fixture: ComponentFixture<QuartoOnlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuartoOnlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuartoOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
