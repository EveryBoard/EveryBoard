import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReversiOldComponent } from './reversi-old.component';

describe('ReversiOldComponent', () => {
  let component: ReversiOldComponent;
  let fixture: ComponentFixture<ReversiOldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReversiOldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReversiOldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
