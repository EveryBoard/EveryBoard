import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwaleOfflineComponent } from './awale-offline.component';

describe('AwaleOfflineComponent', () => {
  let component: AwaleOfflineComponent;
  let fixture: ComponentFixture<AwaleOfflineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwaleOfflineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwaleOfflineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
