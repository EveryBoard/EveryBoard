/* eslint-disable max-lines-per-function */
import { GameNode } from '../GameNode';
import { Move } from '../Move';
import { Player } from '../Player';
import { Rules } from '../Rules';
import { GameState } from '../GameState';
import { comparableEquals, isComparableObject } from 'src/app/utils/Comparable';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { GameStatus } from '../GameStatus';
import { JSONValue, Utils } from 'src/app/utils/utils';
import { EmptyRulesConfig, RulesConfig } from '../RulesConfigUtil';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class RulesUtils {

    public static expectMoveSuccess<R extends Rules<M, S, C, L>,
                                    M extends Move,
                                    S extends GameState,
                                    L,
                                    C extends RulesConfig>(rules: R, state: S, move: M, expectedState: S, config?: C)
    : void
    {
        const legality: MGPFallible<L> = rules.isLegal(move, state, config as C);
        if (legality.isSuccess()) {
            const resultingState: S = rules.applyLegalMove(move, state, config as C, legality.get());
            if (isComparableObject(resultingState)) {
                const equals: boolean = comparableEquals(resultingState, expectedState);
                if (equals === false) {
                    console.log(expectedState, resultingState);
                }
                expect(equals).withContext('comparable states should be equal').toBeTrue();
            } else {
                expect(resultingState).withContext('states should be equal').toEqual(expectedState);
            }
        } else {
            throw new Error('expected move to be valid but it is not: ' + legality.getReason());
        }
    }

    public static expectMoveFailure<R extends Rules<M, S, C, L>,
                                    M extends Move,
                                    S extends GameState,
                                    L,
                                    C extends RulesConfig = EmptyRulesConfig>(rules: R,
                                                                              state: S,
                                                                              move: M,
                                                                              reason: string,
                                                                              config?: C)
    : void
    {
        const legality: MGPFallible<L> = rules.isLegal(move, state, config as C);
        expect(legality.isFailure()).withContext('move should have failed but it succeeded').toBeTrue();
        expect(legality.getReason()).toBe(reason);
    }

    public static expectToBeVictoryFor<R extends Rules<M, S, C, L>,
                                       M extends Move,
                                       S extends GameState,
                                       L,
                                       C extends RulesConfig = EmptyRulesConfig>(
        rules: R,
        node: GameNode<M, S, C>,
        player: Player)
    : void
    {
        expect(rules.getGameStatus(node))
            .withContext('Rules should consider gameStatus a victory for player ' + player.value)
            .toEqual(GameStatus.getVictory(player));
    }

    public static expectToBeOngoing<R extends Rules<M, S, C, L>,
                                    M extends Move,
                                    S extends GameState,
                                    L,
                                    C extends RulesConfig = EmptyRulesConfig>(
        rules: R,
        node: GameNode<M, S, C>)
    : void
    {
        expect(rules.getGameStatus(node)).toEqual(GameStatus.ONGOING);
    }

    public static expectToBeDraw<R extends Rules<M, S, C, L>,
                                 M extends Move,
                                 S extends GameState,
                                 L,
                                 C extends RulesConfig = EmptyRulesConfig>(
        rules: R,
        node: GameNode<M, S, C>)
    : void
    {
        expect(rules.getGameStatus(node)).toBe(GameStatus.DRAW);
    }

    public static expectToThrowAndLog(func: () => void, error: string): void {
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        const expectedErrorMessage: string = 'Assertion failure: ' + error;
        expect(func)
            .withContext('Excpected function to throw error "' + expectedErrorMessage + '"')
            .toThrowError(expectedErrorMessage);
        expect(ErrorLoggerService.logError).toHaveBeenCalledWith('Assertion failure', error);
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
                             C extends RulesConfig>(ruler: Rules<M, S, C, L>,
                                                    encodedMoves: JSONValue[],
                                                    state: S,
                                                    moveDecoder: (em: JSONValue) => M,
                                                    config: MGPOptional<C> = MGPOptional.empty())
    : S
    {
        let i: number = 0;
        for (const encodedMove of encodedMoves) {
            const move: M = moveDecoder(encodedMove);
            if (config.isPresent()) {
                const legality: MGPFallible<L> = ruler.isLegal(move, state, config.get());
                Utils.assert(legality.isSuccess(), `Can't create state from invalid moves (` + i + '): ' + legality.toString() + '.');
                state = ruler.applyLegalMove(move, state, config.get(), legality.get());
            } else {
                const legality: MGPFallible<L> = ruler.isLegal(move, state, {} as C);
                Utils.assert(legality.isSuccess(), `Can't create state from invalid moves (` + i + '): ' + legality.toString() + '.');
                state = ruler.applyLegalMove(move, state, {} as C, legality.get());
            }
            i++;
        }
        return state;
    }

}
