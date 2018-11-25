import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoiningPageComponent } from './joining-page.component';

describe('JoiningPageComponent', () => {
  let component: JoiningPageComponent;
  let fixture: ComponentFixture<JoiningPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoiningPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoiningPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
