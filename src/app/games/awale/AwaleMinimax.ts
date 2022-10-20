import { AwaleState } from './AwaleState';
import { AwaleMove } from './AwaleMove';
import { Minimax } from 'src/app/jscaip/Minimax';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { AwaleNode, AwaleRules } from './AwaleRules';
import { GameStatus } from 'src/app/jscaip/Rules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { Player } from 'src/app/jscaip/Player';

export class AwaleMinimax extends Minimax<AwaleMove, AwaleState> {

    public getListMoves(node: AwaleNode): AwaleMove[] {
        const moves: AwaleMove[] = [];
        const state: AwaleState = node.gameState;
        const turn: number = state.turn;
        const player: number = (turn + 1) % 2; // So player zero is on row 1
        let newMove: AwaleMove;
        let x: number = 0;
        do {
            // for each house that might be playable
            if (state.getPieceAtXY(x, player) !== 0) {
                // if the house is not empty
                newMove = AwaleMove.from(x);
                // see if the move is legal
                const legality: MGPFallible<void> = AwaleRules.isLegal(newMove, state);

                if (legality.isSuccess()) {
                    // if the move is legal, we addPart it to the listMoves
                    newMove = AwaleMove.from(x);

                    moves.push(newMove);
                }
            }
            x++;
        } while (x < 6);
        return this.orderMoves(node, moves);
    }
    private orderMoves(node: AwaleNode, moves: AwaleMove[]): AwaleMove[] {
        const player: Player = node.gameState.getCurrentPlayer();
        const playerY: number = node.gameState.getCurrentOpponent().value;
        const opponentY: number = player.value;
        // sort by captured cases
        ArrayUtils.sortByDescending(moves, (move: AwaleMove): number => {
            const board: number[][] = node.gameState.getCopiedBoard();
            const toDistribute: number = board[playerY][move.x];
            const endCase: Coord = AwaleRules.distribute(move.x, playerY, board);
            let captured: number;
            let sameTerritoryValue: number = 0;
            if (endCase.y === playerY) {
                captured = 0;
                if (toDistribute <= 6) {
                    sameTerritoryValue = 10;
                }
            } else {
                captured = AwaleRules.capture(endCase.x, opponentY, player, board);
            }
            // Prioritise captured, then moves in same territory, then tries to minimise number of pieces distributed
            return captured * 100 + sameTerritoryValue - toDistribute;
        });
        return moves;
    }
    public getBoardValue(node: AwaleNode): BoardValue {
        const gameStatus: GameStatus = AwaleRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return BoardValue.fromWinner(gameStatus.winner);
        }

        const state: AwaleState = node.gameState;
        const captured: number[] = state.getCapturedCopy();
        const c1: number = captured[1];
        const c0: number = captured[0];
        return new BoardValue(c1 - c0);
    }
}
