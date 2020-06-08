import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaharaComponent } from './sahara.component';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

describe('SaharaComponent', () => {

    let component: SaharaComponent;

    let fixture: ComponentFixture<SaharaComponent>;

    beforeAll(() => {
        SaharaComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || SaharaComponent.VERBOSE;
    });
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