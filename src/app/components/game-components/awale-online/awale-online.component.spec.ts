import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwaleOnlineComponent } from './awale-online.component';

describe('AwaleOnlineComponent', () => {
  let component: AwaleOnlineComponent;
  let fixture: ComponentFixture<AwaleOnlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwaleOnlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwaleOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
