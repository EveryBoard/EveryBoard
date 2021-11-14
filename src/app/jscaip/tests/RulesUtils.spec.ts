import { MGPNode } from '../MGPNode';
import { Minimax } from '../Minimax';
import { Move } from '../Move';
import { Player } from '../Player';
import { GameStatus, Rules } from '../Rules';
import { AbstractGameState } from '../GameState';

export class RulesUtils {

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
                .withContext(minimax.name + ' should consider it a draw')
                .toBe(0);
        }
    }
}
