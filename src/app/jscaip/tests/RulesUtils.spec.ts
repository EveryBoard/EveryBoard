/* eslint-disable max-lines-per-function */
import { GameNode } from '../AI/GameNode';
import { Move } from '../Move';
import { Player } from '../Player';
import { SuperRules } from '../Rules';
import { GameState } from '../state/GameState';
import { GameStatus } from '../GameStatus';
import { comparableEquals, isComparableObject, JSONValue, MGPFallible, MGPOptional, Utils } from '@everyboard/lib';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';

export class RulesUtils {

    public static expectMoveSuccess<R extends SuperRules<M, S, C, L>,
                                    M extends Move,
                                    S extends GameState,
                                    L,
                                    C extends RulesConfig>(rules: R,
                                                           state: S,
                                                           move: M,
                                                           expectedState: S,
                                                           config: MGPOptional<C>)
    : void
    {
        const legality: MGPFallible<L> = rules.isLegal(move, state, config);
        if (legality.isSuccess()) {
            const resultingState: S = rules.applyLegalMove(move, state, config, legality.get());
            if (isComparableObject(resultingState)) {
                const equals: boolean = comparableEquals(resultingState, expectedState);
                if (equals === false) {
                    console.log(JSON.stringify(expectedState), JSON.stringify(resultingState));
                }
                expect(equals).withContext('comparable states should be equal').toBeTrue();
            } else {
                expect(resultingState).withContext('states should be equal').toEqual(expectedState);
            }
        } else {
            throw new Error('expected move to be valid but it is not: ' + legality.getReason());
        }
    }

    public static expectMoveFailure<R extends SuperRules<M, S, C, L>,
                                    M extends Move,
                                    S extends GameState,
                                    L,
                                    C extends RulesConfig = EmptyRulesConfig>(
        rules: R,
        state: S,
        move: M,
        reason: string,
        config: MGPOptional<C>)
    : void
    {
        const legality: MGPFallible<L> = rules.isLegal(move, state, config);
        expect(legality.isFailure()).withContext('move should have failed but it succeeded').toBeTrue();
        expect(legality.getReason()).toBe(reason);
    }

    public static expectToBeVictoryFor<R extends SuperRules<M, S, C, L>,
                                       M extends Move,
                                       S extends GameState,
                                       L,
                                       C extends RulesConfig = EmptyRulesConfig>(
        rules: R,
        node: GameNode<M, S>,
        player: Player,
        config: MGPOptional<C> = MGPOptional.empty())
    : void
    {
        expect(rules.getGameStatus(node, config))
            .withContext('Rules should consider gameStatus a victory for ' + player.toString())
            .toEqual(GameStatus.getVictory(player));
    }

    public static expectToBeOngoing<R extends SuperRules<M, S, C, L>,
                                    M extends Move,
                                    S extends GameState,
                                    L,
                                    C extends RulesConfig = EmptyRulesConfig>(
        rules: R,
        node: GameNode<M, S>,
        config: MGPOptional<C> = MGPOptional.empty())
    : void
    {
        expect(rules.getGameStatus(node, config)).toEqual(GameStatus.ONGOING);
    }

    public static expectToBeDraw<R extends SuperRules<M, S, C, L>,
                                 M extends Move,
                                 S extends GameState,
                                 L,
                                 C extends RulesConfig = EmptyRulesConfig>(
        rules: R,
        node: GameNode<M, S>,
        config: MGPOptional<C> = MGPOptional.empty())
    : void
    {
        expect(rules.getGameStatus(node, config)).toBe(GameStatus.DRAW);
    }

    /**
     * @param ruler the rules of the game you need to debug
     * @param encodedMoves the encoded moves that caused the bug
     * @param state the board on which these moves have to be applied
     * @param moveDecoder the move decoder
     * @returns the state creates from applying the moves, enjoy you debug !
     */
    public static applyMoves<S extends GameState,
                             M extends Move,
                             L,
                             C extends RulesConfig>(ruler: SuperRules<M, S, C, L>,
                                                    encodedMoves: JSONValue[],
                                                    state: S,
                                                    moveDecoder: (em: JSONValue) => M,
                                                    config: MGPOptional<C> = MGPOptional.empty())
    : S
    {
        let i: number = 0;
        for (const encodedMove of encodedMoves) {
            const move: M = moveDecoder(encodedMove);
            const legality: MGPFallible<L> = ruler.isLegal(move, state, config);
            Utils.assert(legality.isSuccess(), `Can't create state from invalid moves (` + i + '): ' + legality.toString() + '.');
            state = ruler.applyLegalMove(move, state, config, legality.get());
            i++;
        }
        return state;
    }

}
