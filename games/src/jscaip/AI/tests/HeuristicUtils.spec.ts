import { ArrayUtils } from '@everyboard/lib';

import { EmptyRulesConfig, RulesConfig } from '../../../config/RulesConfig';
import { Move } from '../../Move';
import { Player } from '../../Player';
import { GameState } from '../../state/GameState';
import { BoardValue } from '../BoardValue';
import { GameNode } from '../GameNode';
import { Heuristic } from '../Heuristic';

export class HeuristicUtils {

    public static expectSecondNodeToBeBetterThanFirstFor<
        M extends Move,
        S extends GameState,
        C extends RulesConfig = EmptyRulesConfig
    >(
        heuristic: Heuristic<M, S, BoardValue, C>,
        weakNode: GameNode<M, S>,
        strongNode: GameNode<M, S>,
        player: Player,
        config: C,
    ): void {
        const weakValue: readonly number[] = heuristic.getBoardValue(weakNode, config).metrics;
        const strongValue: readonly number[] = heuristic.getBoardValue(strongNode, config).metrics;
        if (player === Player.ZERO) {
            expect(ArrayUtils.isGreaterThan(weakValue, strongValue))
                .withContext(`First node (${ weakValue }) should be > than second node (${ strongValue })`)
                .toBeTrue();
        } else {
            expect(ArrayUtils.isLessThan(weakValue, strongValue))
                .withContext(`First node (${ weakValue }) should be < than second node (${ strongValue })`)
                .toBeTrue();
        }
    }

    public static expectNodeToBePreVictory<M extends Move, S extends GameState, C extends RulesConfig>(
        node: GameNode<M, S>,
        player: Player,
        heuristics: Heuristic<M, S, BoardValue, C>[],
        config: C,
    ): void {
        for (const heuristic of heuristics) {
            for (const boardSubValue of heuristic.getBoardValue(node, config).metrics) {
                expect(BoardValue.isPreVictoryValue(boardSubValue)).toBeTrue();
                const expectedValue: number = BoardValue.getPreVictoryValueOf(player);
                expect(boardSubValue).toBe(expectedValue);
            }
        }
    }

    public static expectStatesToBeOfEqualValue<M extends Move, S extends GameState, C extends RulesConfig>(
        heuristic: Heuristic<M, S, BoardValue, C>,
        leftState: S,
        rightState: S,
        config: C,
    ): void {
        const leftNode: GameNode<M, S> = GameNode.root(leftState);
        const leftValue: readonly number[] = heuristic.getBoardValue(leftNode, config).metrics;
        const rightNode: GameNode<M, S> = GameNode.root(rightState);
        const rightValue: readonly number[] = heuristic.getBoardValue(rightNode, config).metrics;
        expect(leftValue).withContext('both value should be equal').toEqual(rightValue);
    }

}
