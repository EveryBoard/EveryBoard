import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OldCountDownComponent } from './old-count-down.component';

describe('OldCountDownComponent', () => {
  let component: OldCountDownComponent;
  let fixture: ComponentFixture<OldCountDownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OldCountDownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OldCountDownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
