/* eslint-disable max-lines-per-function */
import { GameNode } from '../MGPNode';
import { Heuristic } from '../Minimax';
import { Move } from '../Move';
import { Player } from '../Player';
import { Rules } from '../Rules';
import { GameState } from '../GameState';
import { comparableEquals, isComparableObject } from 'src/app/utils/Comparable';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ErrorLoggerService } from 'src/app/services/ErrorLoggerService';
import { ErrorLoggerServiceMock } from 'src/app/services/tests/ErrorLoggerServiceMock.spec';
import { GameStatus } from '../GameStatus';
import { JSONValue, Utils } from 'src/app/utils/utils';
import { BoardValue } from '../BoardValue';

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
        player: Player,
        heuristics: Heuristic<M, S>[])
    : void
    {
        expect(rules.getGameStatus(node))
            .withContext('Rules should consider gameStatus a victory for player ' + player.value)
            .toEqual(GameStatus.getVictory(player));
        // TODO: not the case anymore ! for (const heuristic of heuristics) {
        // TODO: not the case anymore !     expect(heuristic.getBoardValue(node).value)
        // TODO: not the case anymore !         .withContext(heuristic.constructor.name.toString() + ' should consider part a victory for player ' + player.value)
        // TODO: not the case anymore !         .toEqual(player.getVictoryValue());
        // TODO: not the case anymore ! }
    }
    public static expectToBeOngoing<R extends Rules<M, S, L>, M extends Move, S extends GameState, L>(
        rules: R,
        node: GameNode<M, S>,
        heuristics: Heuristic<M, S>[])
    : void
    {
        expect(rules.getGameStatus(node)).toEqual(GameStatus.ONGOING);
        for (const heuristic of heuristics) {
            const boardValue: number = heuristic.getBoardValue(node).value;
            // TODO: not the case anymore ! (heuristic could well see that it is a definite victory in many turns
            // TODO: not the case anymore ! expect(boardValue)
            // TODO: not the case anymore !     .withContext(heuristic.constructor.name.toString() + ' should not consider it a victory for player zero.')
            // TODO: not the case anymore !     .not.toEqual(Player.ZERO.getVictoryValue());
            // TODO: not the case anymore ! expect(boardValue)
            // TODO: not the case anymore !     .withContext(heuristic.constructor.name.toString() + ' should not consider it a victory for player one.')
            // TODO: not the case anymore !     .not.toEqual(Player.ONE.getVictoryValue());
        }
    }
    public static expectToBeDraw<R extends Rules<M, S, L>, M extends Move, S extends GameState, L>(
        rules: R,
        node: GameNode<M, S>,
        heuristics: Heuristic<M, S>[])
    : void
    {
        expect(rules.getGameStatus(node)).toBe(GameStatus.DRAW);
        // TODO: not the case anymore ! for (const heuristic of heuristics) {
        // TODO: not the case anymore !     expect(heuristic.getBoardValue(node).value)
        // TODO: not the case anymore !         .withContext(heuristic.constructor.name.toString() + ' should consider it a draw')
        // TODO: not the case anymore !         .toBe(0);
        // TODO: not the case anymore ! }
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
        const weakValue: number = heuristic.getBoardValue(weakNode).value;
        const strongNode: GameNode<M, S> = new GameNode(strongState, MGPOptional.empty(), strongMove);
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
        for (const minimax of heuristics) {
            const node: GameNode<M, S> = new GameNode(state, MGPOptional.empty(), MGPOptional.of(previousMove));
            const value: number = minimax.getBoardValue(node).value;
            const expectedValue: number = player.getPreVictory();
            expect(BoardValue.isPreVictory(value)).toBeTrue();
            expect(value).toBe(expectedValue);
        }
    }
    public static expectToThrowAndLog(func: () => void, error: string): void {
        spyOn(ErrorLoggerService, 'logError').and.callFake(ErrorLoggerServiceMock.logError);
        expect(func).toThrowError('Assertion failure: ' + error);
        expect(ErrorLoggerService.logError).toHaveBeenCalledWith('Assertion failure', error);
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
