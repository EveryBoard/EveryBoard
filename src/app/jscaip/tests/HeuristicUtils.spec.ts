import { BoardValue } from '../BoardValue';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameState } from '../GameState';
import { Move } from '../Move';
import { Heuristic } from '../Minimax';
import { Player } from '../Player';
import { GameNode } from '../GameNode';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';

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
        const weakValue: number = heuristic.getBoardValue(weakNode, config).value;
        const strongNode: GameNode<M, S> = new GameNode(strongState, undefined, strongMove);
        const strongValue: number = heuristic.getBoardValue(strongNode, config).value;
        if (player === Player.ZERO) {
            expect(weakValue).toBeGreaterThan(strongValue);
        } else {
            expect(weakValue).toBeLessThan(strongValue);
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
            const value: number = heuristic.getBoardValue(node, config).value;
            const expectedValue: number = player.getPreVictory();
            expect(BoardValue.isPreVictory(value)).toBeTrue();
            expect(value).toBe(expectedValue);
        }
    }
    public static expectStatesToBeOfEqualValue<M extends Move, S extends GameState, C extends RulesConfig>(
        heuristic: Heuristic<M, S, BoardValue, C>,
        leftState: S,
        rightState: S,
        config: MGPOptional<C>)
    : void {
        const leftNode: GameNode<M, S> = new GameNode(leftState);
        const leftValue: number = heuristic.getBoardValue(leftNode, config).value;
        const rightNode: GameNode<M, S> = new GameNode(rightState);
        const rightValue: number = heuristic.getBoardValue(rightNode, config).value;
        expect(leftValue).withContext('both value should be equal').toEqual(rightValue);
    }
}
