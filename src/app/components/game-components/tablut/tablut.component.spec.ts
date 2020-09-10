import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';

import { TablutComponent } from './tablut.component';
import { INCLUDE_VERBOSE_LINE_IN_TEST, AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { of } from 'rxjs';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { TablutMove } from 'src/app/games/tablut/tablutmove/TablutMove';
import { Coord } from 'src/app/jscaip/coord/Coord';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "Tablut"
            },
        },
    },
}
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null}),

    getAuthenticatedUser: () => { return { pseudo: null, verified: null}; },
};
describe('TablutComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let gameComponent: TablutComponent;

    beforeAll(() => {
        TablutComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || TablutComponent.VERBOSE;
    });
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
            providers: [
                { provide: ActivatedRoute,        useValue: activatedRouteStub },
                { provide: JoueursDAO,            useClass: JoueursDAOMock },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        tick(1);
        gameComponent = wrapper.gameComponent as TablutComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("TablutComponent should be created");
    });
    it('Should enable same action as rules', async() => {
        const isOccupied: boolean = await gameComponent.onClick(4, 1);
        const isLegal: boolean = await gameComponent.onClick(0, 1);
        expect(isOccupied).toBeTruthy('Should be legal to click on player');
        expect(isLegal).toBeTruthy('Simple first move from invader should be legal');
    });
    it('Diagonal move attempt should not throw', async() => {
        expect(await gameComponent.onClick(3, 0)).toBeTruthy(0.5);
        let threw: boolean = false;
        try {
            let diagonalMoveIsLegal: boolean = await gameComponent.onClick(4, 1);
            expect(diagonalMoveIsLegal).toBeFalsy("Move should be considered legal");
        } catch (error) {
            threw = true;
        } finally {
            expect(threw).toBeFalsy("Function threw");
        }
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(TablutMove, "decode").and.callThrough();
        gameComponent.decodeMove(1);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(TablutMove, "encode").and.callThrough();
        gameComponent.encodeMove(new TablutMove(new Coord(1, 1), new Coord(2, 1)));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});