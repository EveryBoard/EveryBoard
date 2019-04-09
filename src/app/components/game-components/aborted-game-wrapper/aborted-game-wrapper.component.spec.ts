import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbortedGameWrapperComponent } from './aborted-game-wrapper.component';

describe('AbortedGameWrapperComponent', () => {
  let component: AbortedGameWrapperComponent;
  let fixture: ComponentFixture<AbortedGameWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbortedGameWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbortedGameWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
