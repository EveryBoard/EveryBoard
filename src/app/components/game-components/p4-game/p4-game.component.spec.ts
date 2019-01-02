import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { P4GameComponent } from './p4-game.component';

describe('P4GameComponent', () => {
  let component: P4GameComponent;
  let fixture: ComponentFixture<P4GameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ P4GameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(P4GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
