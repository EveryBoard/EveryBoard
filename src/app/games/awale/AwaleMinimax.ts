import { AwaleState } from './AwaleState';
import { AwaleMove } from './AwaleMove';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { AwaleNode, AwaleRules } from './AwaleRules';
import { GameStatus } from 'src/app/jscaip/Rules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { Coord } from 'src/app/jscaip/Coord';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class AwaleMinimax extends Minimax<AwaleMove, AwaleState> {

    public getListMoves(node: AwaleNode): AwaleMove[] {
        const moves: AwaleMove[] = [];
        const state: AwaleState = node.gameState;
        const turn: number = state.turn;
        const player: number = turn % 2;
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
        const player: number = node.gameState.getCurrentPlayer().value;
        const opponent: number = node.gameState.getCurrentPlayer().getOpponent().value;
        // sort by captured cases
        ArrayUtils.sortByDescending(moves, (move: AwaleMove): number => {
            const board: number[][] = node.gameState.getCopiedBoard();
            const toDistribute: number = board[player][move.x];
            const endCase: Coord = AwaleRules.distribute(move.x, player, board);
            let captured: number;
            let sameTerritoryValue: number = 0;
            if (endCase.y === player) {
                captured = 0;
                if (toDistribute <= 6) {
                    sameTerritoryValue = 10;
                }
            } else {
                captured = AwaleRules.capture(endCase.x, opponent, player, board);
            }
            // Prioritise captured, then moves in same territory, then tries to minimise number of pieces distributed
            return captured * 100 + sameTerritoryValue - toDistribute;
        });
        return moves;
    }
    public getBoardValue(node: AwaleNode): NodeUnheritance {
        const gameStatus: GameStatus = AwaleRules.getGameStatus(node);
        if (gameStatus.isEndGame) {
            return NodeUnheritance.fromWinner(gameStatus.winner);
        }

        const state: AwaleState = node.gameState;
        const captured: number[] = state.getCapturedCopy();
        const c1: number = captured[1];
        const c0: number = captured[0];
        return new NodeUnheritance(c1 - c0);
    }
}
