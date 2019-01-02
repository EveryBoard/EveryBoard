import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { P4OfflineComponent } from './p4-offline.component';

describe('P4GameComponent', () => {
  let component: P4OfflineComponent;
  let fixture: ComponentFixture<P4OfflineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ P4OfflineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(P4OfflineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
