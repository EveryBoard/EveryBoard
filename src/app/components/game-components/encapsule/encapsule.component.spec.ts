import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EncapsuleComponent } from './encapsule.component';

describe('EncapsuleComponent', () => {

    let component: EncapsuleComponent;

    let fixture: ComponentFixture<EncapsuleComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ EncapsuleComponent ]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(EncapsuleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
});