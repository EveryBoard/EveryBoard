/* eslint-disable max-lines-per-function */
import { fakeAsync } from '@angular/core/testing';
import { TablutComponent } from '../tablut.component';
import { TablutMove } from 'src/app/games/tafl/tablut/TablutMove';
import { Coord } from 'src/app/jscaip/Coord';
import { TaflPawn } from 'src/app/games/tafl/TaflPawn';
import { TablutState } from 'src/app/games/tafl/tablut/TablutState';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table } from 'src/app/utils/ArrayUtils';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { TablutRules } from '../TablutRules';
import { MoveEncoder, NumberEncoder } from 'src/app/utils/Encoder';
import { TaflMinimax } from '../../TaflMinimax';
import { NumberEncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { TaflFailure } from '../../TaflFailure';

describe('TablutComponent', () => {

    let testUtils: ComponentTestUtils<TablutComponent>;

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const x: TaflPawn = TaflPawn.INVADERS;
    const i: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(fakeAsync(async() => {
        MGPNode.ruler = TablutRules.get();
        testUtils = await ComponentTestUtils.forGame<TablutComponent>('Tablut');
    }));
    it('should create', () => {
        expect(testUtils.wrapper).withContext('Wrapper should be created').toBeDefined();
        expect(testUtils.getComponent()).withContext('Component should be created').toBeDefined();
    });
    describe('first click', () => {
        it('Should cancel move when clicking on opponent piece', fakeAsync( async() => {
            // Given any state

            // When clicking on an opponent piece
            // Then the move should be illegal
            await testUtils.expectClickFailure('#click_4_4', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }));
        it('Should cancel move when first click on empty space', fakeAsync( async() => {
            // Given any state
            // When clicking on an empty space
            // Then it should be a failure
            await testUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }));
        it('Should highlight selected piece', fakeAsync(async() => {
            // Given any state

            // When clicking on one of your piece
            await testUtils.expectClickSuccess('#click_4_1');

            // Then it should have selected the piece
            testUtils.expectElementToHaveClass('#piece_4_1', 'selected');
        }));
    });
    describe('second click', () => {
        it('Should allow simple move', fakeAsync(async() => {
            // given a state where first click selected one of your pieces
            await testUtils.expectClickSuccess('#click_4_1');

            // When moving your piece
            const move: TablutMove = TablutMove.of(new Coord(4, 1), new Coord(0, 1));

            // Then the move should be legal
            await testUtils.expectMoveSuccess('#click_0_1', move);
        }));
        it('Diagonal move attempt should not throw', fakeAsync(async() => {
            // given a state where first click selected one of your pieces
            await testUtils.expectClickSuccess('#click_3_0');

            // When attempting diagonal move
            const message: string = TaflFailure.MOVE_MUST_BE_ORTHOGONAL();

            // Then it should not have throwed
            expect(async() => await testUtils.expectClickFailure('#click_2_1', message)).not.toThrow();
        }));
        it('Should show captured piece and left cases', fakeAsync(async() => {
            // Given a board where a capture is ready to be made
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
            testUtils.setupState(initialState);
            await testUtils.expectClickSuccess('#click_1_0');

            // When finalizing the capture
            const move: TablutMove = TablutMove.of(new Coord(1, 0), new Coord(2, 0));
            await testUtils.expectMoveSuccess('#click_2_0', move);

            // Then captured and move highlight should be shown
            const tablutGameComponent: TablutComponent = testUtils.getComponent();
            expect(tablutGameComponent.getRectClasses(2, 1)).toContain('captured');
            expect(tablutGameComponent.getRectClasses(1, 0)).toContain('moved');
            expect(tablutGameComponent.getRectClasses(2, 0)).toContain('moved');
        }));
        it('Should select other piece when clicking on another piece of the player', fakeAsync(async() => {
            // given a state where first click selected one of your pieces
            await testUtils.expectClickSuccess('#click_4_1');

            // When clicking another piece of yours
            await testUtils.expectClickSuccess('#click_5_0');

            // Then that piece should be selected and the previous unselected
            testUtils.expectElementToHaveClass('#piece_5_0', 'selected');
            testUtils.expectElementNotToHaveClass('#piece_4_1', 'selected');
        }));
        it('Should cancelMove when trying to jump over another piece', fakeAsync(async() => {
            // given a state where first click selected one of your pieces
            await testUtils.expectClickSuccess('#click_3_0');

            // When trying an illegal move
            const move: TablutMove = TablutMove.of(new Coord(3, 0), new Coord(3, 6));

            // Then the move should have failed
            const reason: string = RulesFailure.SOMETHING_IN_THE_WAY();
            await testUtils.expectMoveFailure('#click_3_6', reason, move);
            // And the piece should be unselected
            testUtils.expectElementNotToHaveClass('#piece_3_0', 'selected');
        }));
    });
    it('encoder should be correct', () => {
        const encoder: MoveEncoder<TablutMove> = testUtils.getComponent().encoder;
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
