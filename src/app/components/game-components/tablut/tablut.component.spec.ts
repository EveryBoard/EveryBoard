import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablutComponent } from './tablut.component';

describe('TablutComponent', () => {
  let component: TablutComponent;
  let fixture: ComponentFixture<TablutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
