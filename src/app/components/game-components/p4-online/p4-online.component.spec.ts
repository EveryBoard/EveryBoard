import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { P4OnlineComponent } from './p4-online.component';

describe('P4OnlineComponent', () => {
  let component: P4OnlineComponent;
  let fixture: ComponentFixture<P4OnlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ P4OnlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(P4OnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
