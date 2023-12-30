import { BoardValue } from '../AI/BoardValue';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameState } from '../GameState';
import { Move } from '../Move';
import { Heuristic } from '../AI/Minimax';
import { Player } from '../Player';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { GameNode } from '../AI/GameNode';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';

export class HeuristicUtils {

    public static expectSecondStateToBeBetterThanFirstFor<M extends Move,
                                                          S extends GameState,
                                                          C extends RulesConfig = EmptyRulesConfig>(
        heuristic: Heuristic<M, S, BoardValue, C>,
        weakState: S,
        weakMove: MGPOptional<M>,
        strongState: S,
        strongMove: MGPOptional<M>,
        player: Player,
        config: MGPOptional<C>)
    : void
    {
        const weakNode: GameNode<M, S> = new GameNode(weakState, undefined, weakMove);
        const weakValue: readonly number[] = heuristic.getBoardValue(weakNode, config).metrics;
        const strongNode: GameNode<M, S> = new GameNode(strongState, undefined, strongMove);
        const strongValue: readonly number[] = heuristic.getBoardValue(strongNode, config).metrics;
        if (player === Player.ZERO) {
            expect(ArrayUtils.isLessThan(strongValue, weakValue)).toBeTrue();
        } else {
            expect(ArrayUtils.isLessThan(weakValue, strongValue)).toBeTrue();
        }
    }

    public static expectStateToBePreVictory<M extends Move, S extends GameState, C extends RulesConfig>(
        state: S,
        previousMove: M,
        player: Player,
        heuristics: Heuristic<M, S, BoardValue, C>[],
        config: MGPOptional<C>)
    : void
    {
        for (const heuristic of heuristics) {
            const node: GameNode<M, S> = new GameNode(state, MGPOptional.empty(), MGPOptional.of(previousMove));
            for (const boardSubValue of heuristic.getBoardValue(node, config).metrics) {
                const expectedValue: number = player.getPreVictory();
                expect(BoardValue.isPreVictory(boardSubValue)).toBeTrue();
                expect(boardSubValue).toBe(expectedValue);
            }
        }
    }

    public static expectStatesToBeOfEqualValue<M extends Move, S extends GameState, C extends RulesConfig>(
        heuristic: Heuristic<M, S, BoardValue, C>,
        leftState: S,
        rightState: S,
        config: MGPOptional<C>)
    : void {
        const leftNode: GameNode<M, S> = new GameNode(leftState);
        const leftValue: readonly number[] = heuristic.getBoardValue(leftNode, config).metrics;
        const rightNode: GameNode<M, S> = new GameNode(rightState);
        const rightValue: readonly number[] = heuristic.getBoardValue(rightNode, config).metrics;
        expect(leftValue).withContext('both value should be equal').toEqual(rightValue);
    }

}
