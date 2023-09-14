/* eslint-disable max-lines-per-function */
import { MGPNode } from '../MGPNode';
import { Minimax } from '../Minimax';
import { Move } from '../Move';
import { Player } from '../Player';
import { Rules } from '../Rules';
import { GameState } from '../GameState';
import { comparableEquals, isComparableObject } from 'src/app/utils/Comparable';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { SCORE } from '../SCORE';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { GameStatus } from '../GameStatus';
import { BoardValue } from '../BoardValue';
import { JSONValue, Utils } from 'src/app/utils/utils';
import { RulesConfig } from '../ConfigUtil';

export class RulesUtils {

    public static expectMoveSuccess<R extends Rules<M, S, C, L, B>,
                                    M extends Move,
                                    S extends GameState,
                                    L,
                                    B extends BoardValue,
                                    C extends RulesConfig = RulesConfig>(rules: R,
                                                                         state: S,
                                                                         move: M,
                                                                         expectedState: S)
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
    public static expectMoveFailure<R extends Rules<M, S, C, L>,
                                    M extends Move,
                                    S extends GameState,
                                    L,
                                    C extends RulesConfig = RulesConfig>(rules: R,
                                                                         state: S,
                                                                         move: M,
                                                                         reason: string)
    : void
    {
        const legality: MGPFallible<L> = rules.isLegal(move, state);
        expect(legality.isFailure()).withContext('move should have failed but it succeeded').toBeTrue();
        expect(legality.getReason()).toBe(reason);
    }
    public static expectToBeVictoryFor<R extends Rules<M, S, C, L>,
                                       M extends Move,
                                       S extends GameState,
                                       L,
                                       C extends RulesConfig>(rules: R,
                                                              node: MGPNode<R, M, S, C, L>,
                                                              player: Player,
                                                              minimaxes: Minimax<M, S, C, L>[])
    : void
    {
        expect(rules.getGameStatus(node))
            .withContext('Rules should consider gameStatus a victory for player ' + player.value)
            .toEqual(GameStatus.getVictory(player));
        for (const minimax of minimaxes) {
            expect(minimax.getBoardValue(node).value)
                .withContext(minimax.name + ' should consider part a victory for player ' + player.value)
                .toEqual(player.getVictoryValue());
        }
    }
    public static expectToBeOngoing<R extends Rules<M, S, C, L>,
                                    M extends Move,
                                    S extends GameState,
                                    L,
                                    C extends RulesConfig>(rules: R,
                                                           node: MGPNode<R, M, S, C, L>,
                                                           minimaxes: Minimax<M, S, C, L>[])
    : void
    {
        expect(rules.getGameStatus(node)).toEqual(GameStatus.ONGOING);
        for (const minimax of minimaxes) {
            const minimaxBoardValue: number = minimax.getBoardValue(node).value;
            expect(minimaxBoardValue)
                .withContext(minimax.name + ' should not consider it a victory for player zero.')
                .not.toEqual(Player.ZERO.getVictoryValue());
            expect(minimaxBoardValue)
                .withContext(minimax.name + ' should not consider it a victory for player one.')
                .not.toEqual(Player.ONE.getVictoryValue());
        }
    }
    public static expectToBeDraw<R extends Rules<M, S, C, L>,
                                 M extends Move,
                                 S extends GameState,
                                 L,
                                 C extends RulesConfig>(rules: R,
                                                        node: MGPNode<R, M, S, C, L>,
                                                        minimaxes: Minimax<M, S, C, L>[])
    : void
    {
        expect(rules.getGameStatus(node)).toBe(GameStatus.DRAW);
        for (const minimax of minimaxes) {
            expect(minimax.getBoardValue(node).value)
                .withContext(minimax.name + ' should consider it a draw')
                .toBe(0);
        }
    }
    public static expectStatesToBeOfEqualValue<M extends Move, S extends GameState, L, C extends RulesConfig>(
        minimax: Minimax<M, S, C, L>,
        leftState: S,
        rightState: S)
    : void {
        const leftNode: MGPNode<Rules<M, S, C, L>, M, S, C, L> = new MGPNode(leftState,
                                                                             MGPOptional.empty(),
                                                                             MGPOptional.empty(),
                                                                             minimax);
        const leftValue: number = minimax.getBoardValue(leftNode).value;
        const rightNode: MGPNode<Rules<M, S, C, L>, M, S, C, L> = new MGPNode(rightState,
                                                                              MGPOptional.empty(),
                                                                              MGPOptional.empty(),
                                                                              minimax);
        const rightValue: number = minimax.getBoardValue(rightNode).value;
        expect(leftValue).withContext('both value should be equal').toEqual(rightValue);
    }
    public static expectSecondStateToBeBetterThanFirstFor<M extends Move,
                                                          S extends GameState,
                                                          L,
                                                          C extends RulesConfig>(minimax: Minimax<M, S, C, L>,
                                                                                 weakState: S,
                                                                                 weakMove: MGPOptional<M>,
                                                                                 strongState: S,
                                                                                 strongMove: MGPOptional<M>,
                                                                                 player: Player)
    : void
    {
        const weakNode: MGPNode<Rules<M, S, C, L>, M, S, C, L> = new MGPNode(weakState, MGPOptional.empty(), weakMove);
        const weakValue: number = minimax.getBoardValue(weakNode).value;
        const strongNode: MGPNode<Rules<M, S, C, L>, M, S, C, L> =
            new MGPNode(strongState, MGPOptional.empty(), strongMove);
        const strongValue: number = minimax.getBoardValue(strongNode).value;
        if (player === Player.ZERO) {
            expect(weakValue).toBeGreaterThan(strongValue);
        } else {
            expect(weakValue).toBeLessThan(strongValue);
        }
    }
    public static expectStateToBePreVictory<M extends Move, S extends GameState, L, C extends RulesConfig>(
        state: S,
        previousMove: M,
        player: Player,
        minimaxes: Minimax<M, S, C, L>[])
    : void
    {
        for (const minimax of minimaxes) {
            const node: MGPNode<Rules<M, S, C, L>, M, S, C, L> = new MGPNode(state,
                                                                             MGPOptional.empty(),
                                                                             MGPOptional.of(previousMove));
            const value: number = minimax.getBoardValue(node).value;
            const expectedValue: number = player.getPreVictory();
            expect(MGPNode.getScoreStatus(value)).toBe(SCORE.PRE_VICTORY);
            expect(value).toBe(expectedValue);
        }
    }
    public static expectToThrowAndLog(func: () => void, error: string): void {
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        const expectedErrorMessage: string = 'Assertion failure: ' + error;
        expect(func).withContext('Excpected function to throw error "' + expectedErrorMessage + '"').toThrowError(expectedErrorMessage);
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
