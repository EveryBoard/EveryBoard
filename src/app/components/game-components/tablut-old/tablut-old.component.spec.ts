import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablutOldComponent } from './tablut-old.component';

describe('TablutOldComponent', () => {
  let component: TablutOldComponent;
  let fixture: ComponentFixture<TablutOldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablutOldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablutOldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
