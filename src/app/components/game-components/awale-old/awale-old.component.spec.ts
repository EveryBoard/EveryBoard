import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwaleOldComponent } from './awale-old.component';

describe('AwaleOldComponent', () => {
  let component: AwaleOldComponent;
  let fixture: ComponentFixture<AwaleOldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwaleOldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwaleOldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
