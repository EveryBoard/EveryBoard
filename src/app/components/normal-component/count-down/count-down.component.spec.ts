import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountDownComponent } from './count-down.component';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

describe('CountDownComponent', () => {

    let component: CountDownComponent;

    let fixture: ComponentFixture<CountDownComponent>;

    beforeAll(() => {
        CountDownComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST;
    });
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ CountDownComponent ],
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(CountDownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});