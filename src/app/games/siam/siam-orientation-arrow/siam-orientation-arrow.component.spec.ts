import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiamOrientationArrowComponent } from './siam-orientation-arrow.component';

describe('SiamOrientationArrowComponent', () => {
  let component: SiamOrientationArrowComponent;
  let fixture: ComponentFixture<SiamOrientationArrowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiamOrientationArrowComponent]
    });
    fixture = TestBed.createComponent(SiamOrientationArrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
