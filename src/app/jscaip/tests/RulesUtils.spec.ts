import { LegalityStatus } from '../LegalityStatus';
import { MGPNode } from '../MGPNode';
import { Minimax } from '../Minimax';
import { Move } from '../Move';
import { Player } from '../Player';
import { GameStatus, Rules } from '../Rules';
import { AbstractGameState } from '../GameState';
import { comparableEquals, ComparableObject } from 'src/app/utils/Comparable';
export class RulesUtils {

    public static expectMoveSuccess(rules: Rules<Move, AbstractGameState>,
                                    state: AbstractGameState,
                                    move: Move,
                                    expectedState: AbstractGameState)
    : void
    {
        const legality: LegalityStatus = rules.isLegal(move, state);
        expect(legality.legal).toBeTruthy();
        if (legality.legal.isSuccess()) {
            const resultingState: AbstractGameState = rules.applyLegalMove(move, state, legality);
            if (resultingState['equals'] !== null) { // TODOTODO: will be isComparableObject when your branch is merged
                const equals: boolean = comparableEquals(resultingState as unknown as ComparableObject,
                                                         expectedState as unknown as ComparableObject);
                expect(equals).withContext('states should be equal').toBeTrue();
            } else {
                expect(resultingState).withContext('states should be equal').toEqual(expectedState);
            }
        } else {
            throw new Error('expected move to be valid but it is not: ' + legality.legal.getReason());
        }
    }
    public static expectMoveFailure(rules: Rules<Move, AbstractGameState>,
                                    state: AbstractGameState,
                                    move: Move,
                                    reason: string)
    : void
    {
        const legality: LegalityStatus = rules.isLegal(move, state);
        expect(legality.legal.reason).toBe(reason);
    }
    public static expectToBeVictoryFor(rules: Rules<Move, AbstractGameState>,
                                       node: MGPNode<Rules<Move, AbstractGameState>, Move, AbstractGameState>,
                                       player: Player,
                                       minimaxes: Minimax<Move, AbstractGameState>[])
    : void
    {
        expect(rules.getGameStatus(node)).toEqual(GameStatus.getVictory(player));
        for (const minimax of minimaxes) {
            expect(minimax.getBoardValue(node).value)
                .withContext(minimax.name + ' should consider part a victory for player ' + player.value)
                .toEqual(player.getVictoryValue());
        }
    }
    public static expectToBeOngoing(rules: Rules<Move, AbstractGameState>,
                                    node: MGPNode<Rules<Move, AbstractGameState>, Move, AbstractGameState>,
                                    minimaxes: Minimax<Move, AbstractGameState>[])
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
    public static expectToBeDraw(rules: Rules<Move, AbstractGameState>,
                                 node: MGPNode<Rules<Move, AbstractGameState>, Move, AbstractGameState>,
                                 minimaxes: Minimax<Move, AbstractGameState>[])
    : void
    {
        expect(rules.getGameStatus(node)).toBe(GameStatus.DRAW);
        for (const minimax of minimaxes) {
            expect(minimax.getBoardValue(node).value)
                .withContext(minimax.name + ' should consider it a draw').toBe(0);
        }
    }
    public static expectSecondStateToBeBetterThanFirst(weakerState: AbstractGameState,
                                                       weakMove: Move,
                                                       strongerState: AbstractGameState,
                                                       strongMove: Move,
                                                       minimax: Minimax<Move, AbstractGameState>)
    : void
    {
        const weakValue: number = minimax.getBoardValue(new MGPNode(null, weakMove, weakerState)).value;
        const strongValue: number = minimax.getBoardValue(new MGPNode(null, strongMove, strongerState)).value;
        expect(weakValue).toBeLessThan(strongValue);
    }
    public static expectStateToBePreVictory(state: AbstractGameState,
                                            previousMove: Move,
                                            player: Player,
                                            minimax: Minimax<Move, AbstractGameState>)
    : void
    {
        const value: number = minimax.getBoardNumericValue(new MGPNode(null, previousMove, state));
        const expectedValue: number = player.getPreVictory();
        expect(value).toBe(expectedValue);
    }

}
