import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablutComponent } from './tablut.component';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

describe('TablutComponent', () => {

    let component: TablutComponent;

    let fixture: ComponentFixture<TablutComponent>;

    beforeAll(() => {
        TablutComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
    });
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TablutComponent]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(TablutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});