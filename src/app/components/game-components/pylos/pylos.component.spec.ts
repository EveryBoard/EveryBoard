import { PylosComponent } from './pylos.component';
import { PylosMove } from 'src/app/games/pylos/pylos-move/PylosMove';
import { PylosCoord } from 'src/app/games/pylos/pylos-coord/PylosCoord';
import { PylosPartSlice } from 'src/app/games/pylos/pylos-part-slice/PylosPartSlice';
import { Player } from 'src/app/jscaip/player/Player';
import { ComponentTestUtils } from 'src/app/utils/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';

describe('PylosComponent', () => {
    let componentTestUtils: ComponentTestUtils<PylosComponent>;

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    beforeEach(fakeAsync(() => {
        componentTestUtils = new ComponentTestUtils<PylosComponent>('Pylos');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('should allow droping piece on occupable case', fakeAsync(async() => {
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(0, 0, 0), []);
        await componentTestUtils.expectMoveSuccess('#click_0_0_0', move);
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

        await componentTestUtils.expectClickFailure('#click_0_0_0', 'Can\'t click on ennemy pieces.');
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

        await componentTestUtils.expectClickSuccess('#click_3_3_0');
        const move: PylosMove = PylosMove.fromClimb(new PylosCoord(3, 3, 0), new PylosCoord(0, 0, 1), []);
        await componentTestUtils.expectMoveSuccess('#click_0_0_1', move);
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

        await componentTestUtils.expectClickSuccess('#click_1_1_0');
        await componentTestUtils.expectClickSuccess('#click_0_0_0');
        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(1, 1, 0), [new PylosCoord(0, 0, 0)]);
        await componentTestUtils.expectMoveSuccess('#click_0_0_0', move);
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


        await componentTestUtils.expectClickSuccess('#click_1_1_0');
        await componentTestUtils.expectClickSuccess('#click_0_0_0');
        const pylosGameComponent: PylosComponent = componentTestUtils.getComponent();
        expect(pylosGameComponent.getCaseClasses(0, 0, 0)).toEqual(['pre-captured']);
        const captures: PylosCoord[] = [new PylosCoord(0, 0, 0), new PylosCoord(0, 1, 0)];

        const move: PylosMove = PylosMove.fromDrop(new PylosCoord(1, 1, 0), captures);
        await componentTestUtils.expectMoveSuccess('#click_0_1_0', move);
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

        await componentTestUtils.expectClickSuccess('#click_0_0_1');
        await componentTestUtils.expectClickFailure('#click_2_2_0', 'Must move pieces upward.');
    }));
    it('should delegate decoding to move', () => {
        spyOn(PylosMove, 'decode').and.callThrough();
        componentTestUtils.getComponent().decodeMove(0);
        expect(PylosMove.decode).toHaveBeenCalledTimes(1);
    });
    it('should delegate encoding to move', () => {
        spyOn(PylosMove, 'encode').and.callThrough();
        componentTestUtils.getComponent().encodeMove(PylosMove.fromDrop(new PylosCoord(0, 0, 0), []));
        expect(PylosMove.encode).toHaveBeenCalledTimes(1);
    });
});
