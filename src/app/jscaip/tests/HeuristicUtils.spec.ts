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
        heuristic: Heuristic<M, S>,
        weakState: S,
        weakMove: MGPOptional<M>,
        strongState: S,
        strongMove: MGPOptional<M>,
        player: Player)
    : void
    {
        const weakNode: GameNode<M, S, C> = new GameNode(weakState, MGPOptional.empty(), weakMove);
        const weakValue: number = heuristic.getBoardValue(weakNode).value;
        const strongNode: GameNode<M, S, C> = new GameNode(strongState, MGPOptional.empty(), strongMove);
        const strongValue: number = heuristic.getBoardValue(strongNode).value;
        if (player === Player.ZERO) {
            expect(weakValue).toBeGreaterThan(strongValue);
        } else {
            expect(weakValue).toBeLessThan(strongValue);
        }
    }
    public static expectStateToBePreVictory<M extends Move, S extends GameState>(
        state: S,
        previousMove: M,
        player: Player,
        heuristics: Heuristic<M, S>[])
    : void
    {
        for (const heuristic of heuristics) {
            const node: GameNode<M, S> = new GameNode(state, MGPOptional.empty(), MGPOptional.of(previousMove));
            const value: number = heuristic.getBoardValue(node).value;
            const expectedValue: number = player.getPreVictory();
            expect(BoardValue.isPreVictory(value)).toBeTrue();
            expect(value).toBe(expectedValue);
        }
    }
    public static expectStatesToBeOfEqualValue<M extends Move, S extends GameState>(
        heuristic: Heuristic<M, S>,
        leftState: S,
        rightState: S)
    : void {
        const leftNode: GameNode<M, S> = new GameNode(leftState);
        const leftValue: number = heuristic.getBoardValue(leftNode).value;
        const rightNode: GameNode<M, S> = new GameNode(rightState);
        const rightValue: number = heuristic.getBoardValue(rightNode).value;
        expect(leftValue).withContext('both value should be equal').toEqual(rightValue);
    }
}
