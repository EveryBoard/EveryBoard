import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineGameWrapperComponent } from './online-game-wrapper.component';

describe('OnlineGameWrapperComponent', () => {
  let component: OnlineGameWrapperComponent;
  let fixture: ComponentFixture<OnlineGameWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineGameWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineGameWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
