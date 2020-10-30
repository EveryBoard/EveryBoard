import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { QuartoComponent } from './quarto.component';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent } from '../local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { QuartoRules } from 'src/app/games/quarto/quartorules/QuartoRules';
import { QuartoMove } from 'src/app/games/quarto/quartomove/QuartoMove';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: String) => {
                return "Quarto"
            },
        },
    },
}
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null}),

    getAuthenticatedUser: () => { return { pseudo: null, verified: null}; },
};
describe('QuartoComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let fixture: ComponentFixture<LocalGameWrapperComponent>;

    let gameComponent: QuartoComponent;

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
        gameComponent = wrapper.gameComponent as QuartoComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("QuartoComponent should be created");
    });
    it('should accept simple move', () => {
        const rules: QuartoRules = new QuartoRules();
        const listMoves: QuartoMove[] = rules.getListMoves(rules.node).listKeys();
        const currentMove: QuartoMove = listMoves[0];
        expect(gameComponent.chooseCoord(currentMove.coord.x, currentMove.coord.y)).toBeTruthy(0);
        expect(gameComponent.choosePiece(currentMove.piece)).toBeTruthy(1);
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(QuartoMove, "decode").and.callThrough();
        gameComponent.decodeMove(5);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(QuartoMove, "encode").and.callThrough();
        gameComponent.encodeMove(new QuartoMove(2, 2, 2));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});