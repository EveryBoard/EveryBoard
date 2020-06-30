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
        const playerZeroPieces: String[] = component.remainingPieces[0];
        const playerOnePieces: String[] = component.remainingPieces[1];
        expect(playerZeroPieces).toEqual(["BIG_BLACK", "BIG_BLACK", "MEDIUM_BLACK", "MEDIUM_BLACK", "SMALL_BLACK", "SMALL_BLACK"]);
        expect(playerOnePieces).toEqual(["BIG_WHITE", "BIG_WHITE", "MEDIUM_WHITE", "MEDIUM_WHITE", "SMALL_WHITE", "SMALL_WHITE"]);
    });
});