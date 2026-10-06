/* eslint-disable max-lines-per-function */
import { comparableEquals, isComparableObject, MGPFallible } from '@everyboard/lib';

import { EmptyRulesConfig, RulesConfig } from '../../config/RulesConfig';
import { GameNode } from '../AI/GameNode';
import { GameStatus } from '../GameStatus';
import { Move } from '../Move';
import { Player } from '../Player';
import { SuperRules } from '../Rules';
import { GameState } from '../state/GameState';

export class RulesUtils {

    public static expectMoveSuccess<R extends SuperRules<M, S, C, L>,
                                    M extends Move,
                                    S extends GameState,
                                    L,
                                    C extends RulesConfig>(rules: R,
                                                           state: S,
                                                           move: M,
                                                           expectedState: S,
                                                           config: C)
    : void
    {
        const legality: MGPFallible<L> = rules.isLegal(move, state, config);
        if (legality.isSuccess()) {
            const resultingState: S = rules.applyLegalMove(move, state, config, legality.get());
            if (isComparableObject(resultingState)) {
                const equals: boolean = comparableEquals(resultingState, expectedState);
                if (equals === false) {
                    console.log('expected');
                    console.log(JSON.stringify(expectedState));
                    console.log('but got');
                    console.log(JSON.stringify(resultingState));
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
        config: C)
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
        config: C)
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
        config: C)
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
        config: C)
    : void
    {
        expect(rules.getGameStatus(node, config)).toBe(GameStatus.DRAW);
    }

}
