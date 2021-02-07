import { TestBed, tick, fakeAsync } from '@angular/core/testing';

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
import { TablutMove } from 'src/app/games/tablut/tablut-move/TablutMove';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { expectClickFail, expectClickSuccess, expectMoveSubmission, MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
import { TablutCase } from 'src/app/games/tablut/tablut-rules/TablutCase';
import { TablutPartSlice } from 'src/app/games/tablut/TablutPartSlice';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';


const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Tablut';
            },
        },
    },
};
const authenticationServiceStub = {

    getJoueurObs: () => of({ pseudo: null, verified: null }),

    getAuthenticatedUser: () => {
        return { pseudo: null, verified: null };
    },
};
describe('TablutComponent', () => {

    let wrapper: LocalGameWrapperComponent;

    let testElements: TestElements;

    const _: number = TablutCase.UNOCCUPIED.value;
    const x: number = TablutCase.INVADERS.value;
    const i: number = TablutCase.DEFENDERS.value;
    const A: number = TablutCase.PLAYER_ONE_KING.value;

    beforeAll(() => {
        TablutComponent.VERBOSE = INCLUDE_VERBOSE_LINE_IN_TEST || TablutComponent.VERBOSE;
    });
    beforeEach(fakeAsync(async() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                AppModule,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: JoueursDAO, useClass: JoueursDAOMock },
                { provide: AuthenticationService, useValue: authenticationServiceStub },
            ],
        }).compileComponents();
        const fixture = TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        const debugElement = fixture.debugElement;
        tick(1);
        const gameComponent = wrapper.gameComponent as TablutComponent;
        const cancelSpy: jasmine.Spy = spyOn(gameComponent, 'cancelMove').and.callThrough();
        const chooseMoveSpy: jasmine.Spy = spyOn(gameComponent, 'chooseMove').and.callThrough();
        testElements = { fixture, debugElement, gameComponent, cancelSpy, chooseMoveSpy };
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(testElements.gameComponent).toBeTruthy('TablutComponent should be created');
    });
    it('Should cancel move when clicking on opponent piece', fakeAsync( async() => {
        await expectClickFail('#click_4_4', testElements, 'Cette pièce ne vous appartient pas.');
    }));
    it('Should cancel move when first click on empty case', fakeAsync( async() => {
        const message: string = 'Pour votre premier clic, choisissez une de vos pièces.';
        await expectClickFail('#click_0_0', testElements, message);
    }));
    it('Should allow simple move', async () => {
        await expectClickSuccess('#click_4_1', testElements);
        const moveExpectations: MoveExpectations = {
            move: new TablutMove(new Coord(4, 1), new Coord(0, 1)),
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null
        }
        await expectMoveSubmission('#click_0_1', testElements, moveExpectations);
    });
    it('Diagonal move attempt should not throw', async () => {
        await expectClickSuccess('#click_3_0', testElements);
        let threw = false;
        try {
            const message: string = 'TablutMove cannot be diagonal.';
            await expectClickFail('#click_4_1', testElements, message);
        } catch (error) {
            threw = true;
        } finally {
            expect(threw).toBeFalse();
        }
    });
    it('Should show captured piece and left cases', fakeAsync(async() => {
        const board: number[][] = [
            [_, A, _, _, _, _, _, _, _],
            [_, x, x, _, _, _, _, _, _],
            [_, _, i, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const initialSlice: TablutPartSlice = new TablutPartSlice(board, 1);
        testElements.gameComponent.rules.node = new MGPNode(null, null, initialSlice, 0);
        testElements.gameComponent.updateBoard();

        await expectClickSuccess('#click_1_0', testElements);
        const expactions: MoveExpectations = {
            move: new TablutMove(new Coord(1, 0), new Coord(2, 0)),
            slice: initialSlice,
            scoreOne: null,
            scoreZero: null,
        };
        await expectMoveSubmission('#click_2_0', testElements, expactions);

        const tablutGameComponent: TablutComponent = <TablutComponent> testElements.gameComponent;
        expect(tablutGameComponent.getRectFill(2, 1)).toEqual(tablutGameComponent.CAPTURED_FILL);
        expect(tablutGameComponent.getRectFill(1, 0)).toEqual(tablutGameComponent.MOVED_FILL);
        expect(tablutGameComponent.getRectFill(2, 0)).toEqual(tablutGameComponent.MOVED_FILL);
    }));
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(TablutMove, 'decode').and.callThrough();
        testElements.gameComponent.decodeMove(1);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(TablutMove, 'encode').and.callThrough();
        testElements.gameComponent.encodeMove(new TablutMove(new Coord(1, 1), new Coord(2, 1)));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
});
