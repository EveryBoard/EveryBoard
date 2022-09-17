/* eslint-disable max-lines-per-function */
import { BrandhubComponent } from '../brandhub.component';
import { ComponentTestUtils } from 'src/app/utils/tests/TestUtils.spec';
import { fakeAsync } from '@angular/core/testing';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { BrandhubRules } from '../BrandhubRules';
import { BrandhubMove } from '../BrandhubMove';
import { MoveEncoder, NumberEncoder } from 'src/app/utils/Encoder';
import { TaflMinimax } from '../../TaflMinimax';
import { NumberEncoderTestUtils } from 'src/app/utils/tests/Encoder.spec';
import { BrandhubState } from '../BrandhubState';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Coord } from 'src/app/jscaip/Coord';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../../TaflPawn';
import { TaflFailure } from '../../TaflFailure';

describe('BrandhubComponent', () => {

    let testUtils: ComponentTestUtils<BrandhubComponent>;

    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const x: TaflPawn = TaflPawn.INVADERS;
    const i: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(fakeAsync(async() => {
        MGPNode.ruler = BrandhubRules.get();
        testUtils = await ComponentTestUtils.forGame<BrandhubComponent>('Brandhub');
    }));
    it('should create', () => {
        expect(testUtils.wrapper).withContext('Wrapper should be created').toBeDefined();
        expect(testUtils.getComponent()).withContext('Component should be created').toBeDefined();
    });
    it('Should cancel move when clicking on opponent piece', fakeAsync( async() => {
        // Given any state

        // When clicking on an opponent piece
        // Then the move should be illegal
        await testUtils.expectClickFailure('#click_3_3', RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
    }));
    it('Should cancel move when first click on empty space', fakeAsync( async() => {
        await testUtils.expectClickFailure('#click_0_0', RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
    }));
    it('Should allow simple move', fakeAsync(async() => {
        // Given the initial state

        // When moving your piece
        await testUtils.expectClickSuccess('#click_3_1');
        const move: BrandhubMove = BrandhubMove.of(new Coord(3, 1), new Coord(0, 1));

        // Then the move should be legal
        await testUtils.expectMoveSuccess('#click_0_1', move);
    }));
    it('Diagonal move attempt should not throw', fakeAsync(async() => {
        // Given the initial state

        // When attempting diagonal move
        await testUtils.expectClickSuccess('#click_3_0');
        const message: string = TaflFailure.MOVE_MUST_BE_ORTHOGONAL();

        // Then it should not have throwed
        expect(async() => await testUtils.expectClickFailure('#click_4_1', message)).not.toThrow();
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
        const initialState: BrandhubState = new BrandhubState(board, 1);
        testUtils.setupState(initialState);

        await testUtils.expectClickSuccess('#click_1_0');
        const move: BrandhubMove = BrandhubMove.of(new Coord(1, 0), new Coord(2, 0));
        await testUtils.expectMoveSuccess('#click_2_0', move);

        const brandhubGameComponent: BrandhubComponent = testUtils.getComponent();
        expect(brandhubGameComponent.getRectClasses(2, 1)).toContain('captured');
        expect(brandhubGameComponent.getRectClasses(1, 0)).toContain('moved');
        expect(brandhubGameComponent.getRectClasses(2, 0)).toContain('moved');
    }));
    it('encoder should be correct', () => {
        const encoder: MoveEncoder<BrandhubMove> = testUtils.getComponent().encoder;
        const rules: BrandhubRules = BrandhubRules.get();
        rules.node = rules.node.getInitialNode();
        const minimax: TaflMinimax = new TaflMinimax(rules, 'BrandhubMinimax');
        const firstTurnMoves: BrandhubMove[] = minimax
            .getListMoves(rules.node)
            .map((move: BrandhubMove) => BrandhubMove.of(move.coord, move.end));
        for (const move of firstTurnMoves) {
            NumberEncoderTestUtils.expectToBeCorrect(encoder as NumberEncoder<BrandhubMove>, move);
        }
    });
});
