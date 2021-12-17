import { EpaminondasMove } from 'src/app/games/epaminondas/EpaminondasMove';
import { EpaminondasState } from 'src/app/games/epaminondas/EpaminondasState';
import { Direction } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { EpaminondasComponent } from '../epaminondas.component';
import { Coord } from 'src/app/jscaip/Coord';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { EpaminondasFailure } from '../EpaminondasFailure';
import { Table } from 'src/app/utils/ArrayUtils';

describe('EpaminondasComponent', () => {

    let componentTestUtils: ComponentTestUtils<EpaminondasComponent>;

    const _: Player = Player.NONE;
    const X: Player = Player.ONE;
    const O: Player = Player.ZERO;

    function expectClickable(x: number, y: number): void {
        const coord: Coord = new Coord(x, y);
        expect(componentTestUtils.getComponent()
            .getHighlightedCoords().some((c: Coord) => c.equals(coord))).toBeTrue();
    }
    function expectNotClickable(x: number, y: number): void {
        const coord: Coord = new Coord(x, y);
        expect(componentTestUtils.getComponent()
            .getHighlightedCoords().some((c: Coord) => c.equals(coord))).toBeFalse();
    }

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<EpaminondasComponent>('Epaminondas');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeTruthy();
        expect(componentTestUtils.getComponent()).withContext('EpaminondasComponent should be created').toBeTruthy();
    });
    it('Should cancelMove when clicking on empty case at first', fakeAsync(async() => {
        await componentTestUtils.expectClickFailure('#click_5_5', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
    }));
    it('Should not accept opponent click as a move first click', fakeAsync(async() => {
        await componentTestUtils.expectClickFailure('#click_0_0', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    }));
    it('Should show possible next click (after first click)', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_11');

        expectClickable(0, 10);
        expectClickable(0, 9);
        expectClickable(1, 11);
        expectClickable(1, 10);
    }));
    it('Should cancel move when clicking on non aligned pice', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickFailure('#click_2_10', EpaminondasFailure.CASE_NOT_ALIGNED_WITH_SELECTED());
    }));
    it('Should move firstPiece one step when clicking next to it without lastPiece selected', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_10');
        const move: EpaminondasMove = new EpaminondasMove(0, 10, 1, 1, Direction.UP);
        await componentTestUtils.expectMoveSuccess('#click_0_9', move);
    }));
    it('Should not move single piece two step', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_10');
        await componentTestUtils.expectClickFailure('#click_0_8', EpaminondasFailure.SINGLE_PIECE_MUST_MOVE_BY_ONE());
    }));
    it('Should not allow single piece to capture', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_9');
        await componentTestUtils.expectClickFailure('#click_0_8', EpaminondasFailure.SINGLE_PIECE_CANNOT_CAPTURE());
    }));
    it('Should deselect first piece when clicked (and no last piece exist)', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickSuccess('#click_0_11');

        expectClickable(0, 11);
        expectClickable(0, 10);
        expectClickable(0, 9);
    }));
    it('Should cancel move when selecting non-contiguous soldier line', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickFailure('#click_0_9',
                                                    EpaminondasFailure.PHALANX_CANNOT_CONTAIN_EMPTY_CASE());
    }));
    it('Should select all soldier between first selected and new click, and show valid extension and capture both way', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_7');
        await componentTestUtils.expectClickSuccess('#click_0_5');

        expectNotClickable(0, 2);
        expectClickable(0, 3);
        expectClickable(0, 4);
        expectNotClickable(0, 5);
        expectNotClickable(0, 6);
        expectNotClickable(0, 7);
        expectClickable(0, 8);
        expectClickable(0, 9);
        expectClickable(0, 10);
        expectNotClickable(0, 11);
    }));
    it('Should change first piece coord when clicked and last piece is neighboors', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_11'); // select first piece
        await componentTestUtils.expectClickSuccess('#click_0_10'); // select last piece neighboor
        await componentTestUtils.expectClickSuccess('#click_0_11'); // deselect first piece

        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece.isAbsent()).toBeTrue();
        expectClickable(0, 9);
        expectNotClickable(0, 10);
        expectClickable(0, 11);

        expectClickable(1, 9);
        expectClickable(1, 10);
        expectClickable(1, 11);
    }));
    it('Should change first piece coord when clicked and last piece exist but is not neighboors', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_11'); // select first piece
        await componentTestUtils.expectClickSuccess('#click_0_9'); // select last piece neighboor
        await componentTestUtils.expectClickSuccess('#click_0_11'); // deselect first piece

        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece.get()).toEqual(new Coord(0, 9));
        expectNotClickable(0, 8);
        expectNotClickable(0, 9);
        expectNotClickable(0, 10);
        expectClickable(0, 11);
    }));
    it('Should change last piece coord when clicked and first piece is neighboors', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_11'); // select first piece
        await componentTestUtils.expectClickSuccess('#click_0_10'); // select last piece neighboor

        await componentTestUtils.expectClickSuccess('#click_0_10'); // deselect last piece

        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(0, 11));
        expect(epaminondasComponent.lastPiece.isAbsent()).toBeTrue();
        expectClickable(0, 9);
        expectClickable(0, 10);
        expectNotClickable(0, 11);
        expectClickable(1, 10);
        expectClickable(1, 11);
    }));
    it('Should change last piece coord when clicked but first piece is not neighboors', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_11'); // select first piece
        await componentTestUtils.expectClickSuccess('#click_0_8'); // select last piece neighboor

        await componentTestUtils.expectClickSuccess('#click_0_8'); // deselect last piece

        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(0, 11));
        expect(epaminondasComponent.lastPiece.get()).toEqual(new Coord(0, 9));
        expect(epaminondasComponent.getPieceClasses(0, 7)).not.toContain('highlighted');
        expect(epaminondasComponent.getPieceClasses(0, 8)).not.toContain('highlighted');
        expect(epaminondasComponent.getPieceClasses(0, 9)).toContain('highlighted');
        expect(epaminondasComponent.getPieceClasses(0, 10)).toContain('highlighted');
        expect(epaminondasComponent.getPieceClasses(0, 11)).toContain('highlighted');
    }));
    it('Should cancelMove when third click is not aligned with last click', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickSuccess('#click_0_9');

        await componentTestUtils.expectClickFailure('#click_1_7', EpaminondasFailure.CASE_NOT_ALIGNED_WITH_PHALANX());
    }));
    it('Should cancelMove when third click is not aligned with phalanx direction', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickSuccess('#click_0_9');

        await componentTestUtils.expectClickFailure('#click_2_9', EpaminondasFailure.CASE_NOT_ALIGNED_WITH_PHALANX());
    }));
    it('Should cancelMove when third click is an invalid extension', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickSuccess('#click_0_9');

        await componentTestUtils.expectClickFailure('#click_0_7', EpaminondasFailure.PHALANX_CANNOT_CONTAIN_OPPONENT_PIECE());
    }));
    it('Should change first soldier coord when last click was a phalanx extension in the opposite direction of the phalanx', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_1_10');
        await componentTestUtils.expectClickSuccess('#click_2_10');
        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(1, 10));
        expect(epaminondasComponent.lastPiece.get()).toEqual(new Coord(2, 10));

        await componentTestUtils.expectClickSuccess('#click_0_10');

        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(2, 10));
        expect(epaminondasComponent.lastPiece.get()).toEqual(new Coord(0, 10));
    }));
    it('Should change last soldier coord when last click was a phalanx extension in the phalanx direction', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_0_10');
        await componentTestUtils.expectClickSuccess('#click_1_10');
        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece.get()).toEqual(new Coord(1, 10));

        await componentTestUtils.expectClickSuccess('#click_2_10');

        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece.get()).toEqual(new Coord(2, 10));
    }));
    it('End: Should show last move when no move is ongoing (captures, left case, moved phalanx)', fakeAsync(async() => {
        const initialBoard: Table<Player> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [X, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const initialState: EpaminondasState = new EpaminondasState(initialBoard, 0);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_0_11');
        await componentTestUtils.expectClickSuccess('#click_0_9');

        const epaminondasComponent: EpaminondasComponent = componentTestUtils.getComponent();
        const move: EpaminondasMove = new EpaminondasMove(0, 11, 3, 1, Direction.UP);
        await componentTestUtils.expectMoveSuccess('#click_0_8', move);

        expect(epaminondasComponent.getRectClasses(0, 7)).toEqual(['captured']);
        expect(epaminondasComponent.getRectClasses(0, 8)).toEqual(['captured']);
        expect(epaminondasComponent.getRectClasses(0, 9)).toEqual(['moved']);
        expect(epaminondasComponent.getRectClasses(0, 10)).toEqual(['moved']);
        expect(epaminondasComponent.getRectClasses(0, 11)).toEqual(['moved']);
    }));
});
