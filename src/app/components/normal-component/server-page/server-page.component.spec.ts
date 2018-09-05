import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerPageComponent } from './server-page.component';

describe('ServerPageComponent', () => {
  let component: ServerPageComponent;
  let fixture: ComponentFixture<ServerPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
