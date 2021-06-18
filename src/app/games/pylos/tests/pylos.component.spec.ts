import { PylosComponent } from '../pylos.component';
import { PylosMove } from 'src/app/games/pylos/PylosMove';
import { PylosCoord } from 'src/app/games/pylos/PylosCoord';
import { PylosPartSlice } from 'src/app/games/pylos/PylosPartSlice';
import { Player } from 'src/app/jscaip/Player';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

describe('PylosComponent', () => {
    let componentTestUtils: ComponentTestUtils<PylosComponent>;

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<PylosComponent>('Pylos');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('should allow droping piece on occupable case', fakeAsync(async() => {
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), []);
        await componentTestUtils.expectMoveSuccess('#drop_0_0_0', move);
    }));
    it('should forbid clicking on ennemy piece', fakeAsync(async() => {
        const initialBoard: number[][][] = [
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
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickFailure('#piece_0_0_0', RulesFailure.CANNOT_CHOOSE_ENNEMY_PIECE);
    }));
    it('should allow climbing', fakeAsync(async() => {
        const initialBoard: number[][][] = [
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
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#piece_3_3_0');
        const move: PylosMove = PylosMove.fromClimb(new PylosCoord(3, 3, 0), new PylosCoord(0, 0, 1), []);
        await componentTestUtils.expectMoveSuccess('#drop_0_0_1', move);
    }));
    it('should allow capturing unique piece by double clicking on it', fakeAsync(async() => {
        const initialBoard: number[][][] = [
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
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#drop_1_1_0'); // drop
        await componentTestUtils.expectClickSuccess('#piece_0_0_0'); // capture
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(1, 1, 0), [new PylosCoord(0, 0, 0)]);
        await componentTestUtils.expectMoveSuccess('#piece_0_0_0', move); // confirm capture
    }));
    it('should allow captured two pieces, and show capture during move and after', fakeAsync(async() => {
        const initialBoard: number[][][] = [
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
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#drop_1_1_0');
        await componentTestUtils.expectClickSuccess('#piece_0_0_0');
        const pylosGameComponent: PylosComponent = componentTestUtils.getComponent();
        expect(pylosGameComponent.getCaseClasses(0, 0, 0)).toEqual(['pre-captured']);
        const captures: PylosCoord[] = [new PylosCoord(0, 0, 0), new PylosCoord(0, 1, 0)];

        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(1, 1, 0), captures);
        await componentTestUtils.expectMoveSuccess('#piece_0_1_0', move);
        expect(pylosGameComponent.getCaseClasses(1, 1, 0)).toEqual(['moved']);
        expect(pylosGameComponent.getCaseClasses(0, 0, 0)).toEqual(['captured']);
        expect(pylosGameComponent.getCaseClasses(0, 1, 0)).toEqual(['captured']);
    }));
    it('should forbid piece to land lower than they started', fakeAsync(async() => {
        const initialBoard: number[][][] = [
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
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#piece_0_0_1');
        await componentTestUtils.expectClickFailure('#drop_2_2_0', 'Must move pieces upward.');
    }));
    it('should show disappeared square when it has been captured', fakeAsync(async() => {
        const initialBoard: number[][][] = [
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
        const initialSlice: PylosPartSlice = new PylosPartSlice(initialBoard, 0);
        componentTestUtils.setupSlice(initialSlice);

        await componentTestUtils.expectClickSuccess('#drop_2_2_0');
        await componentTestUtils.expectClickSuccess('#piece_0_0_1');
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(2, 2, 0),
                                                   [new PylosCoord(0, 0, 1), new PylosCoord(1, 1, 0)]);
        await componentTestUtils.expectMoveSuccess('#piece_1_1_0', move);
        componentTestUtils.expectElementToExist('#highCapture_0_0_1');
    }));
    it('should show capture highlight during capture, instead of previously square-style');
    it('when showing a capture after a climb, old piece should already be showed as left');
    it('should not show "first capture not valid" but say it in french');
});
