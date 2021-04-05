import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EncapsuleComponent, EncapsuleComponentFailure } from './encapsule.component';

import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication/AuthenticationService';
import { ActivatedRoute } from '@angular/router';
import { AppModule } from 'src/app/app.module';
import { LocalGameWrapperComponent }
    from 'src/app/components/wrapper-components/local-game-wrapper/local-game-wrapper.component';
import { JoueursDAO } from 'src/app/dao/joueurs/JoueursDAO';
import { JoueursDAOMock } from 'src/app/dao/joueurs/JoueursDAOMock';
import { EncapsuleMove } from 'src/app/games/encapsule/encapsule-move/EncapsuleMove';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { EncapsuleCase, EncapsulePartSlice } from 'src/app/games/encapsule/EncapsulePartSlice';
import { EncapsuleFailure, EncapsuleNode } from 'src/app/games/encapsule/encapsule-rules/EncapsuleRules';
import { Player } from 'src/app/jscaip/player/Player';
import { expectClickFail, expectClickSuccess, expectMoveSuccess, expectMoveFailure, MoveExpectations, TestElements } from 'src/app/utils/TestUtils';
import { EncapsulePiece } from 'src/app/games/encapsule/encapsule-piece/EncapsulePiece';
import { Move } from 'src/app/jscaip/Move';

const activatedRouteStub = {
    snapshot: {
        paramMap: {
            get: (str: string) => {
                return 'Encapsule';
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
describe('EncapsuleComponent', () => {
    const _: number = new EncapsuleCase(Player.NONE, Player.NONE, Player.NONE).encode();
    const emptyBoard: number[][] = [
        [_, _, _],
        [_, _, _],
        [_, _, _],
    ];
    const P0Turn: number = 6;
    const P1Turn: number = P0Turn+1;

    let wrapper: LocalGameWrapperComponent;
    let testElements: TestElements;

    function getComponent(): EncapsuleComponent {
        return testElements.gameComponent as EncapsuleComponent;
    }
    function setupSlice(slice: EncapsulePartSlice): void {
        testElements.gameComponent.rules.node = new EncapsuleNode(null, null, slice, 0);
        testElements.gameComponent.updateBoard();
    }
    function expectationFromMove(move: Move): MoveExpectations {
        return {
            move,
            slice: testElements.gameComponent.rules.node.gamePartSlice,
            scoreZero: null,
            scoreOne: null,
        };
    }

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
        const fixture: ComponentFixture<LocalGameWrapperComponent> =
            TestBed.createComponent(LocalGameWrapperComponent);
        wrapper = fixture.debugElement.componentInstance;
        fixture.detectChanges();
        const debugElement: DebugElement = fixture.debugElement;
        tick(1);
        const gameComponent: EncapsuleComponent = wrapper.gameComponent as EncapsuleComponent;
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
        expect(getComponent()).toBeTruthy('EncapsuleComponent should be created');
    });
    it('should delegate decoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(EncapsuleMove, 'decode').and.callThrough();
        getComponent().decodeMove(0);
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        const moveSpy: jasmine.Spy = spyOn(EncapsuleMove, 'encode').and.callThrough();
        getComponent().encodeMove(EncapsuleMove.fromMove(new Coord(1, 1), new Coord(2, 2)));
        expect(moveSpy).toHaveBeenCalledTimes(1);
    });
    it('should drop a piece on the board when selecting it and dropping it', fakeAsync(async() => {
        await expectClickSuccess('#piece_0_SMALL_BLACK', testElements);

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 0));
        await expectMoveSuccess('#click_0_0', testElements, expectationFromMove(move));
    }));
    it('should forbid clicking directly on the board without selecting a piece', fakeAsync(async() => {
        await expectClickFail('#click_0_0', testElements, EncapsuleComponentFailure.INVALID_PIECE_SELECTED);
    }));
    it('should allow dropping a piece on a smaller one', fakeAsync(async() => {
        const x: number = new EncapsuleCase(Player.ONE, Player.NONE, Player.NONE).encode();
        const board: number[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        setupSlice(new EncapsulePartSlice(board, P0Turn, [EncapsulePiece.MEDIUM_BLACK]));
        await expectClickSuccess('#piece_0_MEDIUM_BLACK', testElements);

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.MEDIUM_BLACK, new Coord(0, 1));
        await expectMoveSuccess('#click_0_1', testElements, expectationFromMove(move));
    }));
    it('should forbid dropping a piece on a bigger one', fakeAsync(async() => {
        const x: number = new EncapsuleCase(Player.NONE, Player.ONE, Player.NONE).encode();
        const board: number[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        setupSlice(new EncapsulePartSlice(board, P0Turn, [EncapsulePiece.SMALL_BLACK]));
        await expectClickSuccess('#piece_0_SMALL_BLACK', testElements);

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.SMALL_BLACK, new Coord(0, 1));
        await expectMoveFailure('#click_0_1', testElements,
                                expectationFromMove(move), EncapsuleFailure.INVALID_PLACEMENT);
    }));
    it('should forbid selecting a piece that is not remaining', fakeAsync(async() => {
        setupSlice(new EncapsulePartSlice(emptyBoard, P0Turn, []));

        await expectClickFail('#piece_0_SMALL_BLACK', testElements, EncapsuleComponentFailure.NOT_DROPPABLE);
    }));
    it('should move a piece when clicking on the piece and clicking on its destination coord', fakeAsync(async() => {
        const x: number = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE).encode();
        const board: number[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        setupSlice(new EncapsulePartSlice(board, P0Turn, []));

        await expectClickSuccess('#click_0_1', testElements);

        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 1), new Coord(0, 2));
        await expectMoveSuccess('#click_0_2', testElements, expectationFromMove(move));
    }));
    it('should forbid moving from a case that the player is not controlling', fakeAsync(async() => {
        const x: number = new EncapsuleCase(Player.NONE, Player.ONE, Player.NONE).encode();
        const board: number[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        setupSlice(new EncapsulePartSlice(board, P0Turn, []));

        await expectClickFail('#click_0_1', testElements, EncapsuleComponentFailure.INVALID_PIECE_SELECTED);
    }));
    it('should allow moving a piece on top of a smaller one', fakeAsync(async() => {
        const x: number = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE).encode();
        const X: number = new EncapsuleCase(Player.NONE, Player.NONE, Player.ZERO).encode();
        const board: number[][] = [
            [_, _, _],
            [x, X, _],
            [_, _, _],
        ];
        setupSlice(new EncapsulePartSlice(board, P0Turn, []));

        await expectClickSuccess('#click_1_1', testElements);

        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(1, 1), new Coord(0, 1));
        await expectMoveSuccess('#click_0_1', testElements, expectationFromMove(move));
    }));
    it('should forbid moving a piece on top of a bigger one', fakeAsync(async() => {
        const x: number = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE).encode();
        const X: number = new EncapsuleCase(Player.NONE, Player.NONE, Player.ZERO).encode();
        const board: number[][] = [
            [_, _, _],
            [x, X, _],
            [_, _, _],
        ];
        setupSlice(new EncapsulePartSlice(board, P0Turn, []));

        await expectClickSuccess('#click_0_1', testElements);

        const move: EncapsuleMove = EncapsuleMove.fromMove(new Coord(0, 1), new Coord(1, 1));
        await expectMoveFailure('#click_1_1', testElements,
                                expectationFromMove(move), EncapsuleFailure.INVALID_PLACEMENT);
    }));
    it('should detect victory', fakeAsync(async() => {
        const x: number = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE).encode();
        const X: number = new EncapsuleCase(Player.NONE, Player.NONE, Player.ZERO).encode();
        const board: number[][] = [
            [_, _, _],
            [x, X, _],
            [_, _, _],
        ];
        setupSlice(new EncapsulePartSlice(board, P0Turn, [EncapsulePiece.MEDIUM_BLACK]));

        await expectClickSuccess('#piece_0_MEDIUM_BLACK', testElements);

        const move: EncapsuleMove = EncapsuleMove.fromDrop(EncapsulePiece.MEDIUM_BLACK, new Coord(2, 1));
        await expectMoveSuccess('#click_2_1', testElements, expectationFromMove(move));
        expect(getComponent().rules.getBoardValue(move, getComponent().rules.node.gamePartSlice))
            .toBe(Number.MIN_SAFE_INTEGER);
    }));
    it('should forbid selecting the same coord for destination and origin', fakeAsync(async() => {
        const x: number = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE).encode();
        const board: number[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        setupSlice(new EncapsulePartSlice(board, P0Turn, []));

        await expectClickSuccess('#click_0_1', testElements);

        await expectClickFail('#click_0_1', testElements, EncapsuleComponentFailure.SAME_DEST_AS_ORIGIN);
    }));
    it('should forbid selecting a remaining piece is a move is being constructed', fakeAsync(async() => {
        const x: number = new EncapsuleCase(Player.NONE, Player.ZERO, Player.NONE).encode();
        const board: number[][] = [
            [_, _, _],
            [x, _, _],
            [_, _, _],
        ];
        setupSlice(new EncapsulePartSlice(board, P0Turn, [EncapsulePiece.SMALL_BLACK]));

        await expectClickSuccess('#click_0_1', testElements);

        await expectClickFail('#piece_0_SMALL_BLACK', testElements, EncapsuleComponentFailure.END_YOUR_MOVE);
    }));
});
