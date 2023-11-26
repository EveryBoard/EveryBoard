/* eslint-disable max-lines-per-function */
import { GameNode } from '../GameNode';
import { Move } from '../Move';
import { Player } from '../Player';
import { Rules } from '../Rules';
import { GameState } from '../GameState';
import { comparableEquals, isComparableObject } from 'src/app/utils/Comparable';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { GameStatus } from '../GameStatus';
import { JSONValue, Utils } from 'src/app/utils/utils';

export class RulesUtils {

    public static expectMoveSuccess<R extends Rules<M, S, L>,
                                    M extends Move,
                                    S extends GameState,
                                    L>(rules: R, state: S, move: M, expectedState: S)
    : void
    {
        const legality: MGPFallible<L> = rules.isLegal(move, state);
        if (legality.isSuccess()) {
            const resultingState: S = rules.applyLegalMove(move, state, legality.get());
            if (isComparableObject(resultingState)) {
                const equals: boolean = comparableEquals(resultingState, expectedState);
                expect(equals).withContext('comparable states should be equal').toBeTrue();
            } else {
                expect(resultingState).withContext('states should be equal').toEqual(expectedState);
            }
        } else {
            throw new Error('expected move to be valid but it is not: ' + legality.getReason());
        }
    }
    public static expectMoveFailure<R extends Rules<M, S, L>, M extends Move, S extends GameState, L>(
        rules: R,
        state: S,
        move: M,
        reason: string)
    : void
    {
        const legality: MGPFallible<L> = rules.isLegal(move, state);
        expect(legality.isFailure()).withContext('move should have failed but it succeeded').toBeTrue();
        expect(legality.getReason()).toBe(reason);
    }
    public static expectToBeVictoryFor<R extends Rules<M, S, L>, M extends Move, S extends GameState, L>(
        rules: R,
        node: GameNode<M, S>,
        player: Player)
    : void
    {
        expect(rules.getGameStatus(node))
            .withContext('Rules should consider gameStatus a victory for player ' + player.value)
            .toEqual(GameStatus.getVictory(player));
    }
    public static expectToBeOngoing<R extends Rules<M, S, L>, M extends Move, S extends GameState, L>(
        rules: R,
        node: GameNode<M, S>)
    : void
    {
        expect(rules.getGameStatus(node)).toEqual(GameStatus.ONGOING);
    }
    public static expectToBeDraw<R extends Rules<M, S, L>, M extends Move, S extends GameState, L>(
        rules: R,
        node: GameNode<M, S>)
    : void
    {
        expect(rules.getGameStatus(node)).toBe(GameStatus.DRAW);
    }
    /**
     * @param ruler the rules of the game you need to debug
     * @param encodedMoves the encoded moves that caused the bug
     * @param state the board on which these moves have to be applied
     * @param moveDecoder the move decoder
     * @returns the state creates from applying the moves, enjoy you debug !
     */
    public static applyMoves<S extends GameState, M extends Move, L>(ruler: Rules<M, S, L>,
                                                                     encodedMoves: JSONValue[],
                                                                     state: S,
                                                                     moveDecoder: (em: JSONValue) => M)
    : S
    {
        let i: number = 0;
        for (const encodedMove of encodedMoves) {
            const move: M = moveDecoder(encodedMove);
            const legality: MGPFallible<L> = ruler.isLegal(move, state);
            Utils.assert(legality.isSuccess(), `Can't create state from invalid moves (` + i + '): ' + legality.toString() + '.');
            state = ruler.applyLegalMove(move, state, legality.get());
            i++;
        }
        return state;
    }
}
