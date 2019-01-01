import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuartoOfflineComponent } from './quarto-offline.component';

describe('QuartoOfflineComponent', () => {
  let component: QuartoOfflineComponent;
  let fixture: ComponentFixture<QuartoOfflineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuartoOfflineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuartoOfflineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
