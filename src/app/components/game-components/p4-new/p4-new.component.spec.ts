import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { P4NewComponent } from './p4-new.component';

describe('P4NewComponent', () => {
  let component: P4NewComponent;
  let fixture: ComponentFixture<P4NewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ P4NewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(P4NewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
