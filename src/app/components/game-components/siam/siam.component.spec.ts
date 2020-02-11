import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiamComponent } from './siam.component';

describe('SiamComponent', () => {
  let component: SiamComponent;
  let fixture: ComponentFixture<SiamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SiamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
