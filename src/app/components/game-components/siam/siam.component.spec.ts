import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiamComponent } from './siam.component';
import { INCLUDE_VERBOSE_LINE_IN_TEST } from 'src/app/app.module';

describe('SiamComponent', () => {

    let component: SiamComponent;

    let fixture: ComponentFixture<SiamComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SiamComponent]
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