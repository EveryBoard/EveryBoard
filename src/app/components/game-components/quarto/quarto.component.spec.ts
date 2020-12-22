import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { QuartoComponent } from './quarto.component';

import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
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
import { By } from '@angular/platform-browser';
import { QuartoEnum } from 'src/app/games/quarto/QuartoEnum';
import { QuartoPartSlice } from 'src/app/games/quarto/QuartoPartSlice';
import { MGPNode } from 'src/app/jscaip/mgpnode/MGPNode';

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

    let debugElement: DebugElement;

    let gameComponent: QuartoComponent;

    let clickElement: (elementName: string) => Promise<boolean> = async(elementName: string) => {
        const element: DebugElement = debugElement.query(By.css(elementName));
        if (element == null) {
            return false;
        } else {
            element.triggerEventHandler('click', null);
            await fixture.whenStable();
            fixture.detectChanges();
            return true;
        }
    };
    let doMove: (move: QuartoMove) => Promise<boolean> = async(move: QuartoMove) => {
        const chooseCoordElementName: string = '#chooseCoord_' + move.coord.x + '_' + move.coord.y;
        const choosePieceElementName: string = '#choosePiece_' + move.piece;
        return await clickElement(chooseCoordElementName) &&
               await clickElement(choosePieceElementName);
    };
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
        debugElement = fixture.debugElement;
        tick(1);
        gameComponent = wrapper.gameComponent as QuartoComponent;
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy("Wrapper should be created");
        expect(gameComponent).toBeTruthy("QuartoComponent should be created");
    });
    it('should accept simple move', fakeAsync(async() => {
        const rules: QuartoRules = new QuartoRules(QuartoPartSlice);
        const listMoves: QuartoMove[] = rules.getListMoves(rules.node).listKeys();
        const currentMove: QuartoMove = listMoves[0];

        expect(await doMove(currentMove)).toBeTrue();
        flush();
    }));
    it('should allow to make last move', fakeAsync(async() => {
        const board: number[][] = [
            [QuartoEnum.AABB, QuartoEnum.UNOCCUPIED, QuartoEnum.ABBA, QuartoEnum.BBAA],
            [QuartoEnum.BBAB,       QuartoEnum.BAAA, QuartoEnum.BBBA, QuartoEnum.ABBB],
            [QuartoEnum.BABA,       QuartoEnum.BBBB, QuartoEnum.ABAA, QuartoEnum.AABA],
            [QuartoEnum.AAAA,       QuartoEnum.ABAB, QuartoEnum.BABB, QuartoEnum.BAAB],
        ];
        const pieceInHand: number = QuartoEnum.AAAB;
        const slice: QuartoPartSlice = new QuartoPartSlice(board, 15, pieceInHand);
        gameComponent.rules.node = new MGPNode(null, null, slice, 0);

        spyOn(gameComponent, 'chooseMove').and.callThrough();
        expect(await clickElement('#chooseCoord_1_0')).toBeTrue();
        expect(gameComponent.chooseMove).toHaveBeenCalledWith(new QuartoMove(1, 0, QuartoEnum.UNOCCUPIED), slice, null, null);
        expect(gameComponent.rules.node.gamePartSlice.turn).toBe(16);
    }));
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
