import { fakeAsync } from '@angular/core/testing';
import { SixGameState } from 'src/app/games/six/six-game-state/SixGameState';
import { SixMove } from 'src/app/games/six/six-move/SixMove';
import { SixFailure } from 'src/app/games/six/six-rules/SixFailure';
import { Coord } from 'src/app/jscaip/coord/Coord';
import { Player } from 'src/app/jscaip/player/Player';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { ComponentTestUtils } from 'src/app/utils/TestUtils.spec';
import { JSONValue } from 'src/app/utils/utils/utils';
import { SixComponent } from './six.component';

describe('SixComponent', () => {
    let componentTestUtils: ComponentTestUtils<SixComponent>;

    const _: number = Player.NONE.value;
    const O: number = Player.ZERO.value;
    const X: number = Player.ONE.value;

    beforeEach(fakeAsync(() => {
        componentTestUtils = new ComponentTestUtils<SixComponent>('Six');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).toBeTruthy('Wrapper should be created');
        expect(componentTestUtils.getComponent()).toBeTruthy('Component should be created');
    });
    it('Should drop before 40th turn', fakeAsync(async() => {
        componentTestUtils.fixture.detectChanges();
        const move: SixMove = SixMove.fromDrop(new Coord(0, 2));
        await componentTestUtils.expectMoveSuccess('#neighboor_0_2', move);
    }));
    it('Should do deplacement after the 39th turn and show left coords', fakeAsync(async() => {
        const board: NumberTable = [
            [O],
            [X],
            [O],
            [X],
            [O],
            [X],
        ];
        const state: SixGameState = SixGameState.fromRepresentation(board, 40);
        componentTestUtils.setupSlice(state);

        const gameComponent: SixComponent = componentTestUtils.getComponent();
        await componentTestUtils.expectClickSuccess('#piece_0_0');
        componentTestUtils.expectElementToExist('#selectedPiece_0_0');
        const move: SixMove = SixMove.fromDeplacement(new Coord(0, 0), new Coord(0, 6));
        await componentTestUtils.expectMoveSuccess('#neighboor_0_6', move);

        componentTestUtils.expectElementToExist('#leftCoord_0_-1');
        componentTestUtils.expectElementToExist('#lastDrop_0_5');
        expect(gameComponent.getPieceClass(new Coord(0, 5))).toBe('player0');
    }));
    it('Should ask to cut when needed', fakeAsync(async() => {
        const board: NumberTable = [
            [O, _, O],
            [X, _, O],
            [O, O, X],
            [X, _, _],
        ];
        const state: SixGameState = SixGameState.fromRepresentation(board, 40);
        componentTestUtils.setupSlice(state);

        // Choosing piece
        await componentTestUtils.expectClickSuccess('#piece_1_2');

        // Choosing landing case
        await componentTestUtils.expectClickSuccess('#neighboor_2_3');
        componentTestUtils.expectElementNotToExist('#piece_2_3'); // Landing coord should be filled
        componentTestUtils.expectElementToExist('#chosenLanding_2_3'); // Landing coord should be filled
        componentTestUtils.expectElementNotToExist('#neighboor_2_3'); // And no longer an empty coord

        componentTestUtils.expectElementNotToExist('#piece_1_2'); // Piece should be moved
        componentTestUtils.expectElementToExist('#selectedPiece_1_2'); // Piece should not be highlighted anymore

        // Expect to choosable cut to be showed
        componentTestUtils.expectElementToExist('#cuttable_0_0');
        componentTestUtils.expectElementToExist('#cuttable_0_1');
        componentTestUtils.expectElementToExist('#cuttable_0_2');
        componentTestUtils.expectElementToExist('#cuttable_0_3');
        componentTestUtils.expectElementToExist('#cuttable_2_0');
        componentTestUtils.expectElementToExist('#cuttable_2_1');
        componentTestUtils.expectElementToExist('#cuttable_2_2');
        componentTestUtils.expectElementToExist('#cuttable_2_3');
        const move: SixMove = SixMove.fromCut(new Coord(1, 2), new Coord(2, 3), new Coord(2, 0));
        await componentTestUtils.expectMoveSuccess('#piece_2_0', move);
        componentTestUtils.expectElementToExist('#disconnected_-2_0');
        componentTestUtils.expectElementToExist('#disconnected_-2_1');
        componentTestUtils.expectElementToExist('#disconnected_-2_2');
        componentTestUtils.expectElementToExist('#disconnected_-2_3');
    }));
    it('should highlight winning coords', fakeAsync(async() => {
        const board: number[][] = [
            [O, _, _, _, _, _, _, _, _, _],
            [O, O, O, O, O, X, X, X, X, X],
            [_, _, _, _, _, _, _, _, _, X],
        ];
        const state: SixGameState = SixGameState.fromRepresentation(board, 42);
        componentTestUtils.setupSlice(state);

        await componentTestUtils.expectClickSuccess('#piece_0_0');
        const move: SixMove = SixMove.fromDeplacement(new Coord(0, 0), new Coord(-1, 1));
        await componentTestUtils.expectMoveSuccess('#neighboor_-1_1', move);
        componentTestUtils.expectElementToExist('#victoryCoord_0_0');
        componentTestUtils.expectElementToExist('#victoryCoord_5_0');
    }));
    it('should show as disconnected opponent lastDrop if he\'s dumb enough to do that', fakeAsync(async() => {
        const board: NumberTable = [
            [O, _, O],
            [X, _, O],
            [O, O, X],
            [X, _, _],
        ];
        const state: SixGameState = SixGameState.fromRepresentation(board, 40);
        componentTestUtils.setupSlice(state);

        // Choosing piece
        await componentTestUtils.expectClickSuccess('#piece_1_2');

        // Choosing landing case
        await componentTestUtils.expectClickSuccess('#neighboor_2_3');
        const move: SixMove = SixMove.fromCut(new Coord(1, 2), new Coord(2, 3), new Coord(0, 0));
        await componentTestUtils.expectMoveSuccess('#piece_0_0', move);
        componentTestUtils.expectElementToExist('#disconnected_2_0');
        componentTestUtils.expectElementToExist('#disconnected_2_1');
        componentTestUtils.expectElementToExist('#disconnected_2_2');
        componentTestUtils.expectElementToExist('#disconnected_2_3');
    }));
    it('should cancel move when clicking on piece before 40th turn', fakeAsync(async() => {
        await componentTestUtils.expectClickFailure('#piece_0_0', SixFailure.NO_DEPLACEMENT_BEFORE_TURN_40);
    }));
    it('should cancel move when clicking on empty case as first click after 40th turn', fakeAsync(async() => {
        const board: NumberTable = [
            [O],
            [X],
            [O],
            [X],
            [O],
            [X],
        ];
        const state: SixGameState = SixGameState.fromRepresentation(board, 40);
        componentTestUtils.setupSlice(state);

        await componentTestUtils.expectClickFailure('#neighboor_1_1', SixFailure.CAN_NO_LONGER_DROP);
    }));
    describe('encode/decode', () => {
        it('should delegate decoding to move', () => {
            const encodedMove: JSONValue = SixMove.encoder.encode(SixMove.fromDrop(new Coord(0, 0)));
            spyOn(SixMove.encoder, 'decode').and.callThrough();
            componentTestUtils.getComponent().decodeMove(encodedMove);
            expect(SixMove.encoder.decode).toHaveBeenCalledTimes(1);
        });
        it('should delegate encoding to move', () => {
            spyOn(SixMove.encoder, 'encode').and.callThrough();
            componentTestUtils.getComponent().encodeMove(SixMove.fromDrop(new Coord(0, 0)));
            expect(SixMove.encoder.encode).toHaveBeenCalledTimes(1);
        });
    });
});
