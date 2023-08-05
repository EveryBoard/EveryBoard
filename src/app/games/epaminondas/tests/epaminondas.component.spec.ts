/* eslint-disable max-lines-per-function */
import { EpaminondasMove } from 'src/app/games/epaminondas/EpaminondasMove';
import { EpaminondasState } from 'src/app/games/epaminondas/EpaminondasState';
import { Direction } from 'src/app/jscaip/Direction';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { EpaminondasComponent } from '../epaminondas.component';
import { Coord } from 'src/app/jscaip/Coord';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { EpaminondasFailure } from '../EpaminondasFailure';
import { Table } from 'src/app/utils/ArrayUtils';

describe('EpaminondasComponent', () => {

    let testUtils: ComponentTestUtils<EpaminondasComponent>;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;
    const X: PlayerOrNone = PlayerOrNone.ONE;

    function expectClickable(x: number, y: number): void {
        const coord: Coord = new Coord(x, y);
        expect(testUtils.getGameComponent()
            .getHighlightedCoords().some((c: Coord) => c.equals(coord))).toBeTrue();
    }
    function expectNotClickable(x: number, y: number): void {
        const coord: Coord = new Coord(x, y);
        expect(testUtils.getGameComponent()
            .getHighlightedCoords().some((c: Coord) => c.equals(coord))).toBeFalse();
    }

    beforeEach(fakeAsync(async() => {
        testUtils = await ComponentTestUtils.forGame<EpaminondasComponent>('Epaminondas');
    }));
    it('should create', () => {
        testUtils.expectToBeCreated();
    });
    it('should cancelMove when clicking on empty space at first', fakeAsync(async() => {
        // Given a board
        // When clicking on an empty space
        // Then it should fail
        await testUtils.expectClickFailure('#click_5_5', RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
    }));
    it('should not accept opponent click as a move first click', fakeAsync(async() => {
        // Given a board
        // When clicking on a piece of the opponent
        // Then it should fail
        await testUtils.expectClickFailure('#click_0_0', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    }));
    it('should show possible next click (after first click)', fakeAsync(async() => {
        // Given a board
        const board: Table<PlayerOrNone> = [
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
        const state: EpaminondasState = new EpaminondasState(board, 0);
        testUtils.setupState(state);

        // When the user clicks on one of its pieces
        await testUtils.expectClickSuccess('#click_0_11');

        // Then the pieces that can be clicked next are highlighted
        expectClickable(0, 10);
        expectClickable(0, 9);
        expectClickable(1, 11);
        expectClickable(1, 10);
    }));
    it('should cancel move when clicking on non-aligned piece', fakeAsync(async() => {
        // Given a board where a first piece is selected
        await testUtils.expectClickSuccess('#click_0_11');
        // When clicking on a non-aligned piece
        // Then it should fail
        await testUtils.expectClickFailure('#click_2_10', EpaminondasFailure.SQUARE_NOT_ALIGNED_WITH_SELECTED());
    }));
    it('should move piece one step when clicking on an empty square next to it', fakeAsync(async() => {
        // Given a board with a piece selected
        await testUtils.expectClickSuccess('#click_0_10');
        // When clicking next to the piece on an empty square
        // Then it should succeed as a move
        const move: EpaminondasMove = new EpaminondasMove(0, 10, 1, 1, Direction.UP);
        await testUtils.expectMoveSuccess('#click_0_9', move);
    }));
    it('should not move single piece two step', fakeAsync(async() => {
        // Given a board with a piece selected
        await testUtils.expectClickSuccess('#click_0_10');
        // When trying to move the piece by more than one step
        // Then it should fail
        await testUtils.expectClickFailure('#click_0_8', EpaminondasFailure.SINGLE_PIECE_MUST_MOVE_BY_ONE());
    }));
    it('should not allow single piece to capture', fakeAsync(async() => {
        // Given a board with groups of pieces head-to-head
        const board: Table<PlayerOrNone> = [
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
        const state: EpaminondasState = new EpaminondasState(board, 0);
        testUtils.setupState(state);

        // When moving a single piece onto the opponent's group
        // Then it should fail
        await testUtils.expectClickSuccess('#click_0_9');
        await testUtils.expectClickFailure('#click_0_8', EpaminondasFailure.SINGLE_PIECE_CANNOT_CAPTURE());
    }));
    it('should deselect first piece when clicked (and no last piece exist)', fakeAsync(async() => {
        // Given a board where a piece has been selected
        const board: Table<PlayerOrNone> = [
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
        const state: EpaminondasState = new EpaminondasState(board, 0);
        testUtils.setupState(state);
        await testUtils.expectClickSuccess('#click_0_11'); // select a piece

        // When clicking on the same piece again
        await testUtils.expectClickSuccess('#click_0_11');

        // Then it should not be selected anymore and any piece is clickable
        expectClickable(0, 11);
        expectClickable(0, 10);
        expectClickable(0, 9);
    }));
    it('should cancel move when selecting non-contiguous soldier line', fakeAsync(async() => {
        // Given a board with one piece selected
        const board: Table<PlayerOrNone> = [
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
        const state: EpaminondasState = new EpaminondasState(board, 0);
        testUtils.setupState(state);
        await testUtils.expectClickSuccess('#click_0_11');
        // When clicking on another piece that would create a line with holes
        // Then it should fail
        await testUtils.expectClickFailure('#click_0_9', EpaminondasFailure.PHALANX_CANNOT_CONTAIN_EMPTY_SQUARE());
    }));
    it('should select all soldier between first selected and new click, and show valid extension and capture both way', fakeAsync(async() => {
        // Given a board with a line of soldiers
        const board: Table<PlayerOrNone> = [
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
        const state: EpaminondasState = new EpaminondasState(board, 0);
        testUtils.setupState(state);

        // When clicking on the first and last soldier of the line
        await testUtils.expectClickSuccess('#click_0_7');
        await testUtils.expectClickSuccess('#click_0_5');

        // Then only valid extensions and captures should be clickable
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
    it('should change first piece coord when it is clicked and the last piece is its neighbor', fakeAsync(async() => {
        const board: Table<PlayerOrNone> = [
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
        const state: EpaminondasState = new EpaminondasState(board, 0);
        testUtils.setupState(state);

        await testUtils.expectClickSuccess('#click_0_11'); // select first piece
        await testUtils.expectClickSuccess('#click_0_10'); // select last piece neighbor
        // When deselecting the first piece
        await testUtils.expectClickSuccess('#click_0_11'); // deselect first piece

        // Then it should change the first piece
        const epaminondasComponent: EpaminondasComponent = testUtils.getGameComponent();
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece.isAbsent()).toBeTrue();
        expectClickable(0, 9);
        expectNotClickable(0, 10);
        expectClickable(0, 11);
        expectClickable(1, 9);
        expectClickable(1, 10);
        expectClickable(1, 11);
    }));
    it('should change first piece coord when it is clicked and the last piece exists but is not its neighbor', fakeAsync(async() => {
        const board: Table<PlayerOrNone> = [
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
        const state: EpaminondasState = new EpaminondasState(board, 0);
        testUtils.setupState(state);

        await testUtils.expectClickSuccess('#click_0_11'); // select first piece
        await testUtils.expectClickSuccess('#click_0_9'); // select last piece neighbor
        // When clicking on the first piece again
        await testUtils.expectClickSuccess('#click_0_11'); // deselect first piece

        // Then it should change the first piece
        const epaminondasComponent: EpaminondasComponent = testUtils.getGameComponent();
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece.get()).toEqual(new Coord(0, 9));
        expectNotClickable(0, 8);
        expectNotClickable(0, 9);
        expectNotClickable(0, 10);
        expectClickable(0, 11);
    }));
    it('should change last piece coord when it is clicked and first piece is its neighbor', fakeAsync(async() => {
        const board: Table<PlayerOrNone> = [
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
        const state: EpaminondasState = new EpaminondasState(board, 0);
        testUtils.setupState(state);

        await testUtils.expectClickSuccess('#click_0_11'); // select first piece
        await testUtils.expectClickSuccess('#click_0_10'); // select last piece neighbor

        // When deselecting the last piece
        await testUtils.expectClickSuccess('#click_0_10'); // deselect last piece

        // Then it should change the last piece
        const epaminondasComponent: EpaminondasComponent = testUtils.getGameComponent();
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(0, 11));
        expect(epaminondasComponent.lastPiece.isAbsent()).toBeTrue();
        expectClickable(0, 9);
        expectClickable(0, 10);
        expectNotClickable(0, 11);
        expectClickable(1, 10);
        expectClickable(1, 11);
    }));
    it('should change last piece coord when it is clicked but first piece is not its neighbor', fakeAsync(async() => {
        const board: Table<PlayerOrNone> = [
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
        const state: EpaminondasState = new EpaminondasState(board, 0);
        testUtils.setupState(state);

        await testUtils.expectClickSuccess('#click_0_11'); // select first piece
        await testUtils.expectClickSuccess('#click_0_8'); // select last piece neighbor

        // When clicking on the last piece again
        await testUtils.expectClickSuccess('#click_0_8'); // deselect last piece

        // Then it should change the last piece
        const epaminondasComponent: EpaminondasComponent = testUtils.getGameComponent();
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(0, 11));
        expect(epaminondasComponent.lastPiece.get()).toEqual(new Coord(0, 9));
        expect(epaminondasComponent.getPieceClasses(0, 7)).not.toContain('selected-stroke');
        expect(epaminondasComponent.getPieceClasses(0, 8)).not.toContain('selected-stroke');
        expect(epaminondasComponent.getPieceClasses(0, 9)).toContain('selected-stroke');
        expect(epaminondasComponent.getPieceClasses(0, 10)).toContain('selected-stroke');
        expect(epaminondasComponent.getPieceClasses(0, 11)).toContain('selected-stroke');
    }));
    describe('third click behaviour', () => {
        beforeEach(fakeAsync(async() => {
            // Given a board with aligned soldiers that are selected
            const board: Table<PlayerOrNone> = [
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
            const state: EpaminondasState = new EpaminondasState(board, 0);
            testUtils.setupState(state);

            await testUtils.expectClickSuccess('#click_0_11');
            await testUtils.expectClickSuccess('#click_0_9');
        }));
        it('should cancelMove when third click is not aligned with last click', fakeAsync(async() => {
            // When clicking on a square that is not aligned
            // Then it should fail
            await testUtils.expectClickFailure('#click_1_7', EpaminondasFailure.SQUARE_NOT_ALIGNED_WITH_PHALANX());
        }));
        it('should cancelMove when third click is not aligned with phalanx direction', fakeAsync(async() => {
            // When clicking on a squae that is not aligned
            // Then it should fail
            await testUtils.expectClickFailure('#click_2_9', EpaminondasFailure.SQUARE_NOT_ALIGNED_WITH_PHALANX());
        }));
        it('should cancelMove when third click is an invalid extension', fakeAsync(async() => {
            // When trying to extend the phalanx further, but including a piece of the opponent
            // Then it should fail
            await testUtils.expectClickFailure('#click_0_7', EpaminondasFailure.PHALANX_CANNOT_CONTAIN_OPPONENT_PIECE());
        }));
    });
    it('should change first soldier coord when last click was a phalanx extension in the opposite direction of the phalanx', fakeAsync(async() => {
        // Given a board where a phalanx has already been selected
        await testUtils.expectClickSuccess('#click_1_10');
        await testUtils.expectClickSuccess('#click_2_10');
        const epaminondasComponent: EpaminondasComponent = testUtils.getGameComponent();
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(1, 10));
        expect(epaminondasComponent.lastPiece.get()).toEqual(new Coord(2, 10));

        // When extending the phalanx in the opposite direction of the last click
        // Then it should succeed
        await testUtils.expectClickSuccess('#click_0_10');

        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(2, 10));
        expect(epaminondasComponent.lastPiece.get()).toEqual(new Coord(0, 10));
    }));
    it('should change last soldier coord when last click was a phalanx extension in the phalanx direction', fakeAsync(async() => {
        // Given a board where a phalanx has already been selected
        await testUtils.expectClickSuccess('#click_0_10');
        await testUtils.expectClickSuccess('#click_1_10');
        const epaminondasComponent: EpaminondasComponent = testUtils.getGameComponent();
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece.get()).toEqual(new Coord(1, 10));

        // When extending the phalanx in the same direction as the last click
        await testUtils.expectClickSuccess('#click_2_10');

        // Then it should change lastPiece
        expect(epaminondasComponent.firstPiece.get()).toEqual(new Coord(0, 10));
        expect(epaminondasComponent.lastPiece.get()).toEqual(new Coord(2, 10));
    }));
    it('should show last move when no move is ongoing (captures, left space, moved phalanx)', fakeAsync(async() => {
        // Given a board
        const board: Table<PlayerOrNone> = [
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
        const state: EpaminondasState = new EpaminondasState(board, 0);
        testUtils.setupState(state);

        // When performing a capturing move
        await testUtils.expectClickSuccess('#click_0_11');
        await testUtils.expectClickSuccess('#click_0_9');

        const epaminondasComponent: EpaminondasComponent = testUtils.getGameComponent();
        const move: EpaminondasMove = new EpaminondasMove(0, 11, 3, 1, Direction.UP);
        await testUtils.expectMoveSuccess('#click_0_8', move);

        // Then it should display what has been captured and moved
        expect(epaminondasComponent.getRectClasses(0, 7)).toEqual(['captured-fill']);
        expect(epaminondasComponent.getRectClasses(0, 8)).toEqual(['captured-fill']);
        expect(epaminondasComponent.getRectClasses(0, 9)).toEqual(['moved-fill']);
        expect(epaminondasComponent.getRectClasses(0, 10)).toEqual(['moved-fill']);
        expect(epaminondasComponent.getRectClasses(0, 11)).toEqual(['moved-fill']);
    }));
});
