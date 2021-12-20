import { MGPNode } from '../MGPNode';
import { Minimax } from '../Minimax';
import { Move } from '../Move';
import { Player } from '../Player';
import { GameStatus, Rules } from '../Rules';
import { GameState } from '../GameState';
import { comparableEquals, isComparableObject } from 'src/app/utils/Comparable';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { SCORE } from '../SCORE';

export class RulesUtils {

    public static expectMoveSuccess<R extends Rules<M, S, L>, M extends Move, S extends GameState, L>(
        rules: R,
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
                expect(equals).withContext('states should be equal').toBeTrue();
            } else {
                expect(resultingState).withContext('states should be equals').toEqual(expectedState);
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
        node: MGPNode<R, M, S, L>,
        player: Player,
        minimaxes: Minimax<M, S, L>[])
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
    public static expectToBeOngoing<R extends Rules<M, S, L>, M extends Move, S extends GameState, L>(
        rules: R,
        node: MGPNode<R, M, S, L>,
        minimaxes: Minimax<M, S, L>[])
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
    public static expectToBeDraw<R extends Rules<M, S, L>, M extends Move, S extends GameState, L>(
        rules: R,
        node: MGPNode<R, M, S, L>,
        minimaxes: Minimax<M, S, L>[])
    : void
    {
        expect(rules.getGameStatus(node)).toBe(GameStatus.DRAW);
        for (const minimax of minimaxes) {
            expect(minimax.getBoardValue(node).value)
                .withContext(minimax.name + ' should consider it a draw')
                .toBe(0);
        }
    }
    public static expectSecondStateToBeBetterThanFirstFor<M extends Move, S extends GameState, L>(
        minimax: Minimax<M, S, L>,
        weakerState: S,
        weakMove: MGPOptional<M>,
        strongerState: S,
        strongMove: MGPOptional<M>,
        player: Player)
    : void
    {
        const weakValue: number =
            minimax.getBoardValue(new MGPNode(weakerState, MGPOptional.empty(), weakMove)).value;
        const strongValue: number =
            minimax.getBoardValue(new MGPNode(strongerState, MGPOptional.empty(), strongMove)).value;
        if (player === Player.ZERO) {
            expect(weakValue).toBeGreaterThan(strongValue);
        } else {
            expect(weakValue).toBeLessThan(strongValue);
        }
    }
    public static expectStateToBePreVictory<M extends Move, S extends GameState, L>(
        state: S,
        previousMove: M,
        player: Player,
        minimaxes: Minimax<M, S, L>[])
    : void
    {
        for (const minimax of minimaxes) {
            const node: MGPNode<Rules<M, S, L>, M, S, L> = new MGPNode(state,
                                                                       MGPOptional.empty(),
                                                                       MGPOptional.of(previousMove));
            const value: number = minimax.getBoardNumericValue(node);
            const expectedValue: number = player.getPreVictory();
            expect(MGPNode.getScoreStatus(value)).toBe(SCORE.PRE_VICTORY);
            expect(value).toBe(expectedValue);
        }
    }
}
