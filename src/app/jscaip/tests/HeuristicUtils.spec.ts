import { BoardValue } from '../AI/BoardValue';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameState } from '../GameState';
import { Move } from '../Move';
import { Heuristic } from '../AI/Minimax';
import { Player } from '../Player';
import { GameNode } from '../AI/GameNode';

export class HeuristicUtils {

    public static expectSecondStateToBeBetterThanFirstFor<M extends Move, S extends GameState>(
        heuristic: Heuristic<M, S>,
        weakState: S,
        weakMove: MGPOptional<M>,
        strongState: S,
        strongMove: MGPOptional<M>,
        player: Player)
    : void
    {
        const weakNode: GameNode<M, S> = new GameNode(weakState, MGPOptional.empty(), weakMove);
        const weakValue: number = heuristic.getBoardValue(weakNode).value[0];
        const strongNode: GameNode<M, S> = new GameNode(strongState, MGPOptional.empty(), strongMove);
        const strongValue: number = heuristic.getBoardValue(strongNode).value[0];
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
            const value: number = heuristic.getBoardValue(node).value[0];
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
        const leftValue: number = heuristic.getBoardValue(leftNode).value[0];
        const rightNode: GameNode<M, S> = new GameNode(rightState);
        const rightValue: number = heuristic.getBoardValue(rightNode).value[0];
        expect(leftValue).withContext('both value should be equal').toEqual(rightValue);
    }

}
