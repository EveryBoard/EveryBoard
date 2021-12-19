import { DvonnComponent } from '../dvonn.component';
import { Coord } from 'src/app/jscaip/Coord';
import { DvonnMove } from 'src/app/games/dvonn/DvonnMove';
import { DvonnPieceStack } from 'src/app/games/dvonn/DvonnPieceStack';
import { DvonnState } from 'src/app/games/dvonn/DvonnState';
import { Player } from 'src/app/jscaip/Player';
import { fakeAsync } from '@angular/core/testing';
import { DvonnFailure } from 'src/app/games/dvonn/DvonnFailure';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';

describe('DvonnComponent', () => {

    let componentTestUtils: ComponentTestUtils<DvonnComponent>;

    const __: DvonnPieceStack = DvonnPieceStack.EMPTY;
    const D_: DvonnPieceStack = DvonnPieceStack.SOURCE;
    const W_: DvonnPieceStack = DvonnPieceStack.PLAYER_ZERO;
    const WW: DvonnPieceStack = new DvonnPieceStack(Player.ZERO, 2, false);

    beforeEach(fakeAsync(async() => {
        componentTestUtils = await ComponentTestUtils.forGame<DvonnComponent>('Dvonn');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeDefined();
        expect(componentTestUtils.getComponent()).withContext('DvonnComponent should be created').toBeDefined();
    });
    it('should not allow to pass initially', fakeAsync(async() => {
        expect((await componentTestUtils.getComponent().pass()).isFailure()).toBeTrue();
    }));
    it('should allow valid moves', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_2_0');
        const move: DvonnMove = DvonnMove.of(new Coord(2, 0), new Coord(2, 1));
        await componentTestUtils.expectMoveSuccess('#click_2_1', move);
    }));
    it('should allow to pass if stuck position', fakeAsync(async() => {
        const board: Table<DvonnPieceStack> = [
            [__, __, WW, __, __, __, __, __, __, __, __],
            [__, __, D_, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ];
        const state: DvonnState = new DvonnState(board, 0, false);
        componentTestUtils.setupState(state);
        expect(componentTestUtils.getComponent().canPass).toBeTrue();
        expect((await componentTestUtils.getComponent().pass()).isSuccess()).toBeTrue();
    }));
    it('should forbid choosing an incorrect piece', fakeAsync(async() => {
        // select black piece (but white plays first)
        await componentTestUtils.expectClickFailure('#click_1_1', DvonnFailure.NOT_PLAYER_PIECE());
    }));
    it('should show disconnection/captures precisely', fakeAsync(async() => {
        // given board with ready disconnection
        const board: Table<DvonnPieceStack> = [
            [__, __, WW, __, __, __, __, __, __, __, __],
            [__, __, D_, W_, W_, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
            [__, __, __, __, __, __, __, __, __, __, __],
        ];
        componentTestUtils.setupState(new DvonnState(board, 0, false));

        // When doing that disconnection
        await componentTestUtils.expectClickSuccess('#click_3_1');
        const move: DvonnMove = DvonnMove.of(new Coord(3, 1), new Coord(2, 1));
        await componentTestUtils.expectMoveSuccess('#click_2_1', move);

        const gameComponent: DvonnComponent = componentTestUtils.getComponent();
        // expect board to show it
        expect(gameComponent.disconnecteds).toEqual([
            { coord: new Coord(4, 1), caseContent: W_ },
        ]);
    }));
    it('should allow clicking twice on a piece to deselect it', fakeAsync(async() => {
        await componentTestUtils.expectClickSuccess('#click_2_0');
        await componentTestUtils.expectClickSuccess('#click_2_0');
        expect(componentTestUtils.getComponent().chosen).toEqual(MGPOptional.empty());
    }));
});

