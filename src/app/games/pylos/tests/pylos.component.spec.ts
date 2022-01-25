/* eslint-disable max-lines-per-function */
import { PylosComponent } from '../pylos.component';
import { PylosMove } from 'src/app/games/pylos/PylosMove';
import { PylosCoord } from 'src/app/games/pylos/PylosCoord';
import { PylosState } from 'src/app/games/pylos/PylosState';
import { Player } from 'src/app/jscaip/Player';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { PylosFailure } from '../PylosFailure';

describe('PylosComponent', () => {

    let componentTestUtils: ComponentTestUtils<PylosComponent>;

    const _: Player = Player.NONE;
    const O: Player = Player.ZERO;
    const X: Player = Player.ONE;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<PylosComponent>('Pylos');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeTruthy();
    });
    it('should allow droping piece on occupable space', fakeAsync(async() => {
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), []);
        await componentTestUtils.expectMoveSuccess('#drop_0_0_0', move);
    }));
    it('should forbid clicking on opponent piece', fakeAsync(async() => {
        const initialBoard: Player[][][] = [
            [
                [X, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickFailure('#piece_0_0_0', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    }));
    it('should allow climbing', fakeAsync(async() => {
        const initialBoard: Player[][][] = [
            [
                [O, X, _, _],
                [X, O, _, _],
                [_, _, _, _],
                [_, _, _, O],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#piece_3_3_0');
        const move: PylosMove = PylosMove.fromClimb(new PylosCoord(3, 3, 0), new PylosCoord(0, 0, 1), []);
        await componentTestUtils.expectMoveSuccess('#drop_0_0_1', move);
    }));
    it('should allow capturing unique piece by double clicking on it', fakeAsync(async() => {
        const initialBoard: Player[][][] = [
            [
                [O, O, _, _],
                [O, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#drop_1_1_0'); // drop
        await componentTestUtils.expectClickSuccess('#piece_1_1_0'); // capture
        const pylosGameComponent: PylosComponent = componentTestUtils.getComponent();
        const expectedClasses: string[] = ['player0', 'selected', 'pre-captured'];
        expect(pylosGameComponent.getPieceClasses(1, 1, 0)).toEqual(expectedClasses);
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(1, 1, 0), [new PylosCoord(1, 1, 0)]);
        await componentTestUtils.expectMoveSuccess('#piece_1_1_0', move); // confirm capture
    }));
    it('should allow captured two pieces, and show capture during move and after', fakeAsync(async() => {
        const initialBoard: Player[][][] = [
            [
                [O, O, _, _],
                [O, _, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [_, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#drop_1_1_0');
        await componentTestUtils.expectClickSuccess('#piece_0_0_0');
        const pylosGameComponent: PylosComponent = componentTestUtils.getComponent();
        expect(pylosGameComponent.getPieceClasses(0, 0, 0)).toEqual(['player0', 'pre-captured']);
        const captures: PylosCoord[] = [new PylosCoord(0, 0, 0), new PylosCoord(0, 1, 0)];

        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(1, 1, 0), captures);
        await componentTestUtils.expectMoveSuccess('#piece_0_1_0', move);
        expect(pylosGameComponent.getSquareClasses(1, 1, 0)).toEqual(['moved']);
        expect(pylosGameComponent.getSquareClasses(0, 0, 0)).toEqual(['captured']);
        expect(pylosGameComponent.getSquareClasses(0, 1, 0)).toEqual(['captured']);
    }));
    it('should forbid piece to land lower than they started', fakeAsync(async() => {
        const initialBoard: Player[][][] = [
            [
                [O, X, _, _],
                [X, O, _, _],
                [_, _, _, _],
                [_, _, _, _],
            ], [
                [O, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#piece_0_0_1');
        await componentTestUtils.expectClickFailure('#drop_2_2_0', PylosFailure.MUST_MOVE_UPWARD());
    }));
    it('should show disappeared square when it has been captured', fakeAsync(async() => {
        const initialBoard: Player[][][] = [
            [
                [O, X, _, _],
                [X, O, O, _],
                [_, O, _, _],
                [_, _, _, _],
            ], [
                [O, _, _],
                [_, _, _],
                [_, _, _],
            ], [
                [_, _],
                [_, _],
            ], [
                [_],
            ],
        ];
        const initialState: PylosState = new PylosState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#drop_2_2_0');
        await componentTestUtils.expectClickSuccess('#piece_0_0_1');
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(2, 2, 0),
                                                   [new PylosCoord(0, 0, 1), new PylosCoord(1, 1, 0)]);
        await componentTestUtils.expectMoveSuccess('#piece_1_1_0', move);
        componentTestUtils.expectElementToExist('#highCapture_0_0_1');
    }));
});
