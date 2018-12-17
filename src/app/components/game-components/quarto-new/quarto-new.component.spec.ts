import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuartoNewComponent } from './quarto-new.component';

describe('QuartoNewComponent', () => {
  let component: QuartoNewComponent;
  let fixture: ComponentFixture<QuartoNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuartoNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuartoNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
