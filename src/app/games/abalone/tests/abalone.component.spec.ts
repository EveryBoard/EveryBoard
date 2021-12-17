import { fakeAsync } from '@angular/core/testing';
import { Coord } from 'src/app/jscaip/Coord';
import { FourStatePiece } from 'src/app/jscaip/FourStatePiece';
import { HexaDirection } from 'src/app/jscaip/HexaDirection';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { AbaloneComponent } from '../abalone.component';
import { AbaloneFailure } from '../AbaloneFailure';
import { AbaloneState } from '../AbaloneState';
import { AbaloneMove } from '../AbaloneMove';

describe('AbaloneComponent', () => {

    const _: FourStatePiece = FourStatePiece.EMPTY;
    const N: FourStatePiece = FourStatePiece.NONE;
    const O: FourStatePiece = FourStatePiece.ZERO;
    const X: FourStatePiece = FourStatePiece.ONE;
    let componentTestUtils: ComponentTestUtils<AbaloneComponent>;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<AbaloneComponent>('Abalone');
    }));
    describe('first click', () => {
        it('should highlight selected piece and show legal directions choice when clicking piece', fakeAsync(async() => {
            // Given the initial board

            // when clicking on a piece
            await componentTestUtils.expectClickSuccess('#piece_2_6');

            // then highlight and 5 arrows should be shown
            componentTestUtils.expectElementToExist('#direction_LEFT');
            componentTestUtils.expectElementToExist('#direction_UP');
            componentTestUtils.expectElementToExist('#direction_UP_RIGHT');

            componentTestUtils.expectElementNotToExist('#direction_RIGHT');
            componentTestUtils.expectElementNotToExist('#direction_DOWN');
            componentTestUtils.expectElementNotToExist('#direction_DOWN_LEFT');
        }));
        it('should cancel move when clicking on opponent piece', fakeAsync(async() => {
            // Given the initial board

            // when clicking on an opponent piece
            // then expect click to be a failure
            await componentTestUtils.expectClickFailure('#piece_8_0', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }));
    });
    describe('second piece click', () => {
        it('should show translation and pushings directions when second piece is clicked', fakeAsync(async() => {
            // Given the initial board

            // when clicking on a piece then a second
            await componentTestUtils.expectClickSuccess('#piece_2_6');
            await componentTestUtils.expectClickSuccess('#piece_4_6');

            // then legal direction should be shown and others not
            componentTestUtils.expectElementToExist('#direction_LEFT');
            componentTestUtils.expectElementToExist('#direction_UP');
            componentTestUtils.expectElementToExist('#direction_UP_RIGHT');
            componentTestUtils.expectElementToExist('#direction_RIGHT');

            componentTestUtils.expectElementNotToExist('#direction_DOWN_LEFT');
            componentTestUtils.expectElementNotToExist('#direction_DOWN');
        }));
        it('should unselect single piece when reclicking it', fakeAsync(async() => {
            // Given the initial board
            // when clicking a piece
            await componentTestUtils.expectClickSuccess('#piece_2_7');

            // then it should be highlighted
            const compo: AbaloneComponent = componentTestUtils.getComponent();
            expect(compo.getPieceClasses(2, 7)).toEqual(['player0', 'highlighted']);

            // when reclicking it
            await componentTestUtils.expectClickSuccess('#piece_2_7');

            // then it should no longer be highlighted
            expect(compo.getPieceClasses(2, 7)).toEqual(['player0']);
        }));
        it('should select clicked piece when not aligned with first (non dir)', fakeAsync(async() => {
            // Given the initial board with first click
            await componentTestUtils.expectClickSuccess('#piece_2_6');

            // when clicking second unaligned coord
            await componentTestUtils.expectClickSuccess('#piece_4_7');

            // expect first to be unselected and new to be selected
            const compo: AbaloneComponent = componentTestUtils.getComponent();
            expect(compo.getPieceClasses(2, 6)).toEqual(['player0']);
            expect(compo.getPieceClasses(4, 7)).toEqual(['player0', 'highlighted']);
        }));
        it('should select clicked piece when not aligned with first (non hexa dir)', fakeAsync(async() => {
            // Given the initial board with first click
            await componentTestUtils.expectClickSuccess('#piece_2_6');

            // when clicking second unaligned coord
            await componentTestUtils.expectClickSuccess('#piece_3_7');

            // expect first to be unselected and new to be selected
            const compo: AbaloneComponent = componentTestUtils.getComponent();
            expect(compo.getPieceClasses(2, 6)).toEqual(['player0']);
            expect(compo.getPieceClasses(3, 7)).toEqual(['player0', 'highlighted']);
        }));
        it('should change first coord to clicked coord if valid extension side but hole in the extension', fakeAsync(async() => {
            // Given a board with a possible "holed line" selection
            const board: Table<FourStatePiece> = [
                [N, N, N, N, X, X, X, X, X],
                [N, N, N, X, X, X, X, X, X],
                [N, N, _, _, X, X, X, _, _],
                [N, _, _, _, _, _, _, _, _],
                [_, _, _, _, _, _, _, _, _],
                [_, O, _, _, _, _, _, _, N],
                [_, _, _, O, O, _, _, N, N],
                [O, O, O, O, O, O, N, N, N],
                [O, O, O, O, O, N, N, N, N],
            ];
            const state: AbaloneState = new AbaloneState(board, 0);
            componentTestUtils.setupState(state);
            await componentTestUtils.expectClickSuccess('#piece_1_5');

            // when choosing the piece that is aligned and at good distance but not making a line
            await componentTestUtils.expectClickSuccess('#piece_1_7');

            // then the old piece should be unselected and the new one selected
            const compo: AbaloneComponent = componentTestUtils.getComponent();
            expect(compo.getPieceClasses(1, 5)).toEqual(['player0']);
            expect(compo.getPieceClasses(1, 7)).toEqual(['player0', 'highlighted']);
        }));
        it('should cancel move when trying to select more than three pieces', fakeAsync(async() => {
            // Given the initial board with one piece selected
            await componentTestUtils.expectClickSuccess('#piece_0_7');

            // when clicking 3 case on the right
            await componentTestUtils.expectClickFailure('#piece_3_7', AbaloneFailure.CANNOT_MOVE_MORE_THAN_THREE_PIECES());

            // then piece should no longer be selected
            const compo: AbaloneComponent = componentTestUtils.getComponent();
            expect(compo.getCaseClasses(0, 7)).toEqual([]);
        }));
    });
    describe('third click', () => {
        it('should deselect first piece only when reclicked, and change it', fakeAsync(async() => {
            // Given the initial board with 2 pieces selected
            await componentTestUtils.expectClickSuccess('#piece_2_6');
            await componentTestUtils.expectClickSuccess('#piece_3_6');

            // when clicking first piece
            await componentTestUtils.expectClickSuccess('#piece_2_6');

            // then only one piece should be selected
            const compo: AbaloneComponent = componentTestUtils.getComponent();
            expect(compo.getPieceClasses(2, 6)).toEqual(['player0']);
            expect(compo.getPieceClasses(3, 6)).toEqual(['player0', 'highlighted']);
        }));
        it('should deselect last piece selected when reclicked', fakeAsync(async() => {
            // Given the initial board with 2 pieces selected
            await componentTestUtils.expectClickSuccess('#piece_2_6');
            await componentTestUtils.expectClickSuccess('#piece_3_6');

            // when clicking first piece
            await componentTestUtils.expectClickSuccess('#piece_3_6');

            // then only one piece should be selected
            const compo: AbaloneComponent = componentTestUtils.getComponent();
            expect(compo.getPieceClasses(2, 6)).toEqual(['player0', 'highlighted']);
            expect(compo.getPieceClasses(3, 6)).toEqual(['player0']);
        }));
        it('should cancel move when clicking middle piece of a 3 piece column and selecting middle', fakeAsync(async() => {
            // Given the initial board
            // when clicking first coord then third coord
            await componentTestUtils.expectClickSuccess('#piece_2_7');
            await componentTestUtils.expectClickSuccess('#piece_4_7');

            // then three pieces should be highlighted
            const compo: AbaloneComponent = componentTestUtils.getComponent();
            expect(compo.getPieceClasses(2, 7)).toEqual(['player0', 'highlighted']);
            expect(compo.getPieceClasses(3, 7)).toEqual(['player0', 'highlighted']);
            expect(compo.getPieceClasses(4, 7)).toEqual(['player0', 'highlighted']);

            // when reclicking middle one
            await componentTestUtils.expectClickSuccess('#piece_3_7');

            // then all three pieces should be unselected
            expect(compo.getPieceClasses(2, 7)).toEqual(['player0']);
            expect(compo.getPieceClasses(3, 7)).toEqual(['player0']);
            expect(compo.getPieceClasses(4, 7)).toEqual(['player0']);
        }));
        it('should cancel move then select clicked piece as first piece when it is not aligned with first piece', fakeAsync(async() => {
            // Given the initial board with a line selected
            await componentTestUtils.expectClickSuccess('#piece_2_6');
            await componentTestUtils.expectClickSuccess('#piece_4_6');

            // when clicking on not aligned piece, then expect failure
            await componentTestUtils.expectClickFailure('#piece_4_7', AbaloneFailure.LINE_AND_COORD_NOT_ALIGNED());
        }));
        it('should cancel move then select clicked piece as first piece when it is not aligned with second piece', fakeAsync(async() => {
            // Given the initial board with a line selected
            await componentTestUtils.expectClickSuccess('#piece_2_6');
            await componentTestUtils.expectClickSuccess('#piece_4_6');

            // when clicking on not aligned piece, then expect failure
            await componentTestUtils.expectClickFailure('#piece_2_7', AbaloneFailure.LINE_AND_COORD_NOT_ALIGNED());
        }));
        it('should recognize line extension and show new directions (1-2-3)', fakeAsync(async() => {
            // Given the initial board with an extendable two piece line selected
            await componentTestUtils.expectClickSuccess('#piece_2_6');
            await componentTestUtils.expectClickSuccess('#piece_3_6');

            // when clicking third one
            await componentTestUtils.expectClickSuccess('#piece_4_6');

            // then three pieces should be selected
            const compo: AbaloneComponent = componentTestUtils.getComponent();
            expect(compo.getPieceClasses(2, 6)).toEqual(['player0', 'highlighted']);
            expect(compo.getPieceClasses(3, 6)).toEqual(['player0', 'highlighted']);
            expect(compo.getPieceClasses(4, 6)).toEqual(['player0', 'highlighted']);
        }));
        it('should recognize line extension and show new directions (M-2-1-3) and move it as one', fakeAsync(async() => {
            // Given the initial board with an extendable two piece line selected
            await componentTestUtils.expectClickSuccess('#piece_3_6');
            await componentTestUtils.expectClickSuccess('#piece_2_6');

            // when clicking third one then moving them
            await componentTestUtils.expectClickSuccess('#piece_4_6');
            const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(4, 6), HexaDirection.LEFT).get();
            const state: AbaloneState = AbaloneState.getInitialState();
            await componentTestUtils.expectMoveSuccess('#direction_LEFT', move, state, [0, 0]);

            // then three pieces should be selected
            const compo: AbaloneComponent = componentTestUtils.getComponent();
            expect(compo.getCaseClasses(1, 6)).toEqual(['moved']);
            expect(compo.getCaseClasses(2, 6)).toEqual(['moved']);
            expect(compo.getCaseClasses(3, 6)).toEqual(['moved']);
            expect(compo.getCaseClasses(4, 6)).toEqual(['moved']);
        }));
        it('should refuse too long extension', fakeAsync(async() => {
            // Given the initial board with two case selected
            await componentTestUtils.expectClickSuccess('#piece_0_7');
            await componentTestUtils.expectClickSuccess('#piece_1_7');

            // when selecting an aligned piece too far
            // then move should be cancel for "too-long-line" reason
            await componentTestUtils.expectClickFailure('#piece_3_7', AbaloneFailure.CANNOT_MOVE_MORE_THAN_THREE_PIECES());
        }));
    });
    describe('direction click', () => {
        it('should do move when clicking direction', fakeAsync(async() => {
            // Given the initial board with piece selected
            await componentTestUtils.expectClickSuccess('#piece_0_7');

            // when clicking on coord then direction
            // then the move should be done
            const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(0, 7), HexaDirection.UP).get();
            const state: AbaloneState = AbaloneState.getInitialState();
            await componentTestUtils.expectMoveSuccess('#direction_UP', move, state, [0, 0]);
        }));
    });
    it('should allow clicking on arrow landing coord as if it was the arrow (case)', fakeAsync(async() => {
        // Given the initial board with first case clicked
        await componentTestUtils.expectClickSuccess('#piece_2_6');

        // when clicking on the case marked by the direction instead of it's arrow
        // then the move should have been done
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(2, 6), HexaDirection.LEFT).get();
        const state: AbaloneState = AbaloneState.getInitialState();
        await componentTestUtils.expectMoveSuccess('#case_1_6', move, state, [0, 0]);
    }));
    it('should allow clicking on arrow landing coord as if it was bellow an arrow (opponent)', fakeAsync(async() => {
        // Given a board with a possible push
        const board: Table<FourStatePiece> = [
            [N, N, N, N, X, X, X, X, X],
            [N, N, N, X, X, X, X, X, X],
            [N, N, _, _, _, X, X, _, _],
            [N, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, X, _, _, _, _, _, N],
            [_, _, O, O, O, _, _, N, N],
            [O, O, O, O, O, O, N, N, N],
            [O, O, O, O, O, N, N, N, N],
        ];
        const state: AbaloneState = new AbaloneState(board, 0);
        componentTestUtils.setupState(state);
        await componentTestUtils.expectClickSuccess('#piece_2_6');
        await componentTestUtils.expectClickSuccess('#piece_2_7');

        // when clicking on the case marked by the direction instead of it's arrow
        // then the move should have been done
        const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(2, 7), HexaDirection.UP).get();
        await componentTestUtils.expectMoveSuccess('#piece_2_5', move, state, [0, 0]);
    }));
    it('should not do anything when clicking case that are not below a direction arrow', fakeAsync(async() => {
        // Given the initial board with first case clicked
        await componentTestUtils.expectClickSuccess('#case_1_6');

        // when clicking on the case marked by the direction instead of it's arrow
        // then expect nothing, just want this line covered!
    }));
    describe('showLastMove', () => {
        it('should show last move moved pieces (translation)', fakeAsync(async() => {
            // given an initial board with two aligned pieces selected
            await componentTestUtils.expectClickSuccess('#piece_2_6');
            await componentTestUtils.expectClickSuccess('#piece_3_6');

            // when clicking the direction
            // then the translation move should be done
            const move: AbaloneMove =
                AbaloneMove.fromDoubleCoord(new Coord(2, 6), new Coord(3, 6), HexaDirection.UP).get();
            const state: AbaloneState = AbaloneState.getInitialState();
            await componentTestUtils.expectMoveSuccess('#direction_UP', move, state, [0, 0]);
        }));
        it('should show last move moved pieces (push)', fakeAsync(async() => {
            // given a board with a previous move
            await componentTestUtils.expectClickSuccess('#piece_0_7');
            await componentTestUtils.expectClickSuccess('#piece_0_8');
            const move: AbaloneMove = AbaloneMove.fromSingleCoord(new Coord(0, 7), HexaDirection.DOWN).get();
            const state: AbaloneState = AbaloneState.getInitialState();
            await componentTestUtils.expectMoveSuccess('#direction_DOWN', move, state, [0, 0]);

            // when ? then expect to see left and moved case
            const compo: AbaloneComponent = componentTestUtils.getComponent();
            expect(compo.getCaseClasses(0, 7)).toEqual(['moved']);
            expect(compo.getCaseClasses(0, 8)).toEqual(['moved']);
        }));
    });
});
