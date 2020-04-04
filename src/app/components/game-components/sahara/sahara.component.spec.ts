import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaharaComponent } from './sahara.component';

describe('SaharaComponent', () => {

    let component: SaharaComponent;

    let fixture: ComponentFixture<SaharaComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SaharaComponent]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(SaharaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});