import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { P4Component } from './p4.component';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

describe('P4Component', () => {

    let component: P4Component;

    let fixture: ComponentFixture<P4Component>;

    beforeAll(() => {
        P4Component.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || P4Component.VERBOSE;
    });
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [P4Component]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(P4Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
