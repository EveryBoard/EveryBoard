import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { KamisadoComponent, KamisadoComponentFailure } from './kamisado.component';

import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { KamisadoMove } from 'src/app/games/kamisado/kamisado-move/KamisadoMove';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { expectClickFail, expectClickSuccess, expectMoveFailure, expectMoveSuccess, MoveExpectations, TestElements }
    from 'src/app/utils/TestUtils';
import { KamisadoPartSlice } from 'src/app/games/kamisado/KamisadoPartSlice';
import { KamisadoColor } from 'src/app/games/kamisado/KamisadoColor';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { KamisadoPiece } from 'src/app/games/kamisado/KamisadoPiece';
import { KamisadoFailure, KamisadoNode } from 'src/app/games/kamisado/kamisado-rules/KamisadoRules';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Kamisado';
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
describe('KamisadoComponent', () => {
    let wrapper: LocalGameWrapperComponent;
    let testElements: TestElements;

    const _: number = KamisadoPiece.NONE.getValue();
    const R: number = KamisadoPiece.ZERO.RED.getValue();
    const G: number = KamisadoPiece.ZERO.GREEN.getValue();
    const r: number = KamisadoPiece.ONE.RED.getValue();
    const b: number = KamisadoPiece.ONE.BROWN.getValue();

    function getComponent(): KamisadoComponent {
        return testElements.gameComponent as KamisadoComponent;
    }
    function setupSlice(slice: KamisadoPartSlice): void {
        testElements.gameComponent.rules.node = new KamisadoNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
    }
    function expectationFromMove(move: KamisadoMove): MoveExpectations {
        return {
            move,
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null,
        };
    }

    beforeEach(fakeAsync(() => {
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
        const fixture: ComponentFixture<LocalGameWrapperComponent> = TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        const debugElement: DebugElement = fixture.debugElement;
        tick(1);
        const gameComponent: KamisadoComponent = wrapper.gameComponent as KamisadoComponent;
        const cancelMoveSpy: jasmine.Spy = spyOn(gameComponent, 'cancelMove').and.callThrough();
        const chooseMoveSpy: jasmine.Spy = spyOn(gameComponent, 'chooseMove').and.callThrough();
        const onLegalUserMoveSpy: jasmine.Spy = spyOn(wrapper, 'onLegalUserMove').and.callThrough();
        const canUserPlaySpy: jasmine.Spy = spyOn(gameComponent, 'canUserPlay').and.callThrough();
        testElements = {
            fixture,
            debugElement,
            gameComponent,
            canUserPlaySpy,
            cancelMoveSpy,
            chooseMoveSpy,
            onLegalUserMoveSpy,
        };
    }));
    it('should create', () => {
        expect(wrapper).toBeTruthy('Wrapper should be created');
        expect(getComponent()).toBeTruthy('KamisadoComponent should be created');
    });
    it('should choose (-1,-1) as chosen coord when calling updateBoard without move', () => {
        getComponent().updateBoard();
        expect(getComponent().chosen.equals(new Coord(-1, -1))).toBeTrue();
    });
    it('should not allow to pass initially', fakeAsync(async() => {
        expect((await getComponent().pass()).isSuccess()).toBeFalse();
    }));
    it('should allow changing initial choice', fakeAsync(async() => {
        await expectClickSuccess('#click_0_7', testElements); // Select initial piece
        await expectClickSuccess('#click_1_7', testElements); // Select another piece
        expect(getComponent().chosen.equals(new Coord(1, 7))).toBeTrue();
    }));
    it('should allow deselecting initial choice', fakeAsync(async() => {
        await expectClickSuccess('#click_0_7', testElements); // Select initial piece
        await expectClickSuccess('#click_0_7', testElements); // Deselect it
        expect(getComponent().chosen.equals(new Coord(-1, -1))).toBeTrue();
    }));
    it('should allow to pass if stuck position', fakeAsync(async() => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [b, r, _, _, _, _, _, _],
            [R, G, _, _, _, _, _, _], // red is stuck
        ];
        setupSlice(new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board));

        expect((await getComponent().pass()).isSuccess()).toBeTrue();
    }));
    it('should forbid de-selecting a piece that is pre-selected', fakeAsync(async() => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _], // brown is stuck
            [R, _, _, _, _, _, _, _],
        ];
        setupSlice(new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board));

        await expectClickFail('#click_0_7', testElements, KamisadoComponentFailure.PLAY_WITH_SELECTED_PIECE);
    }));
    it('should forbid selecting a piece if one is already pre-selected', fakeAsync(async() => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _], // brown is stuck
            [R, G, _, _, _, _, _, _],
        ];
        setupSlice(new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board));

        await expectClickFail('#click_1_7', testElements, KamisadoComponentFailure.PLAY_WITH_SELECTED_PIECE);
    }));
    it('should forbid moving to invalid location', fakeAsync(async() => {
        await expectClickSuccess('#click_0_7', testElements);
        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(5, 4));
        await expectMoveFailure('#click_5_4', testElements,
                                expectationFromMove(move), KamisadoFailure.DIRECTION_NOT_ALLOWED);
    }));
    it('should forbid choosing an incorrect piece', fakeAsync(async() => {
        await expectClickFail('#click_0_0', testElements, KamisadoFailure.NOT_PIECE_OF_PLAYER);
    }));
    it('should forbid choosing a piece at end of the game', fakeAsync(async() => {
        const board: number[][] = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _], // brown is stuck
            [R, r, _, _, _, _, _, _],
        ];
        setupSlice(new KamisadoPartSlice(6, KamisadoColor.RED, MGPOptional.of(new Coord(0, 7)), false, board));

        const move: KamisadoMove = KamisadoMove.of(new Coord(0, 7), new Coord(0, 0));
        await expectMoveFailure('#click_0_0', testElements, expectationFromMove(move), KamisadoFailure.GAME_ENDED);
        expect((getComponent().choosePiece(2, 0)).isSuccess()).toBeFalse(); // can't select a piece either
    }));
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(KamisadoMove, 'decode').and.callThrough();
        getComponent().decodeMove(5);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(KamisadoMove, 'encode').and.callThrough();
        getComponent().encodeMove(KamisadoMove.of(new Coord(0, 7), new Coord(0, 6)));
        expect(KamisadoMove.encode).toHaveBeenCalledTimes(1);
    });
});
