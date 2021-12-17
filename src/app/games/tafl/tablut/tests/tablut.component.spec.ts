import { TablutComponent } from '../tablut.component';
import { TablutMove } from 'src/app/games/tafl/tablut/TablutMove';
import { Coord } from 'src/app/jscaip/Coord';
import { TaflPawn } from 'src/app/games/tafl/TaflPawn';
import { TablutState } from 'src/app/games/tafl/tablut/TablutState';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { TablutRules } from '../TablutRules';
import { MoveEncoder, NumberEncoder } from 'src/app/jscaip/Encoder';
import { TaflMinimax } from '../../TaflMinimax';
import { NumberEncoderTestUtils } from 'src/app/jscaip/tests/Encoder.spec';

describe('TablutComponent', () => {

    let componentTestUtils: ComponentTestUtils<TablutComponent>;

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const x: TaflPawn = TaflPawn.INVADERS;
    const i: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(fakeAsync(async() => {
        MGPNode.ruler = TablutRules.get();
        componentTestUtils = await ComponentTestUtils.forGame<TablutComponent>('Tablut');
    }));
    it('should create', () => {
        expect(componentTestUtils.wrapper).withContext('Wrapper should be created').toBeDefined();
        expect(componentTestUtils.getComponent()).withContext('Component should be created').toBeDefined();
    });
    it('Should cancel move when clicking on opponent piece', fakeAsync( async() => {
        // Given any state
        const state: TablutState = TablutState.getInitialState();
        componentTestUtils.setupState(state);

        // When clicking on an opponent piece
        // Then the move should be illegal
        await componentTestUtils.expectClickFailure('#click_4_4', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    }));
    it('Should cancel move when first click on empty case', fakeAsync( async() => {
        await componentTestUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    }));
    it('Should allow simple move', fakeAsync(async() => {
        // given the initial state
        const state: TablutState = TablutState.getInitialState();
        componentTestUtils.setupState(state);

        // When moving your piece
        await componentTestUtils.expectClickSuccess('#click_4_1');
        const move: TablutMove = TablutMove.of(new Coord(4, 1), new Coord(0, 1));

        // Then the move should be legal
        await componentTestUtils.expectMoveSuccess('#click_0_1', move);
    }));
    it('Diagonal move attempt should not throw', fakeAsync(async() => {
        // given the initial state
        const state: TablutState = TablutState.getInitialState();
        componentTestUtils.setupState(state);

        // When attempting diagonal move
        await componentTestUtils.expectClickSuccess('#click_3_0');
        const message: string = 'TaflMove cannot be diagonal.';

        // Then it should not have throwed
        expect(async() => await componentTestUtils.expectClickFailure('#click_4_1', message)).not.toThrow();
    }));
    it('Should show captured piece and left cases', fakeAsync(async() => {
        const board: Table<TaflPawn> = [
            [_, A, _, _, _, _, _, _, _],
            [_, x, x, _, _, _, _, _, _],
            [_, _, i, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const initialState: TablutState = new TablutState(board, 1);
        componentTestUtils.setupState(initialState);

        await componentTestUtils.expectClickSuccess('#click_1_0');
        const move: TablutMove = TablutMove.of(new Coord(1, 0), new Coord(2, 0));
        await componentTestUtils.expectMoveSuccess('#click_2_0', move);

        const tablutGameComponent: TablutComponent = componentTestUtils.getComponent();
        expect(tablutGameComponent.getRectClasses(2, 1)).toContain('captured');
        expect(tablutGameComponent.getRectClasses(1, 0)).toContain('moved');
        expect(tablutGameComponent.getRectClasses(2, 0)).toContain('moved');
    }));
    it('encoder should be correct', () => {
        const encoder: MoveEncoder<TablutMove> = componentTestUtils.getComponent().encoder;
        const rules: TablutRules = TablutRules.get();
        rules.node = rules.node.getInitialNode();
        const minimax: TaflMinimax = new TaflMinimax(rules, 'TablutMinimax');
        const firstTurnMoves: TablutMove[] = minimax
            .getListMoves(rules.node)
            .map((move: TablutMove) => TablutMove.of(move.coord, move.end));
        for (const move of firstTurnMoves) {
            NumberEncoderTestUtils.expectToBeCorrect(encoder as NumberEncoder<TablutMove>, move);
        }
    });
});
