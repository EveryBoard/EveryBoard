import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablutOfflineComponent } from './tablut-offline.component';

describe('TablutOfflineComponent', () => {
  let component: TablutOfflineComponent;
  let fixture: ComponentFixture<TablutOfflineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablutOfflineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablutOfflineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
