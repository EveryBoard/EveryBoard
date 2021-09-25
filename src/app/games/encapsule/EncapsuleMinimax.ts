import { EncapsuleState, EncapsuleCase } from './EncapsuleState';
import { Coord } from 'src/app/jscaip/Coord';
import { Sets } from 'src/app/utils/Sets';
import { EncapsuleLegalityStatus } from './EncapsuleLegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { Table } from 'src/app/utils/ArrayUtils';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsulePiece } from './EncapsulePiece';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { EncapsuleRules, EncapsuleNode } from './EncapsuleRules';
import { GameStatus } from 'src/app/jscaip/Rules';

export class EncapsuleMinimax extends Minimax<EncapsuleMove, EncapsuleState, EncapsuleLegalityStatus> {

    public getBoardValue(node: EncapsuleNode): NodeUnheritance {
        const status: GameStatus = EncapsuleRules.getGameStatus(node);
        return new NodeUnheritance(status.toBoardValue());
    }
    public getListMoves(n: EncapsuleNode): EncapsuleMove[] {
        const moves: EncapsuleMove[] = [];
        const state: EncapsuleState = n.gameState;
        const board: Table<EncapsuleCase> = state.toCaseBoard();
        const currentPlayer: Player = state.getCurrentPlayer();
        const puttablePieces: EncapsulePiece[] = Sets.toComparableObjectSet(state.getPlayerRemainingPieces());
        for (let y: number = 0; y < 3; y++) {
            for (let x: number = 0; x < 3; x++) {
                const coord: Coord = new Coord(x, y);
                // each drop
                for (const piece of puttablePieces) {
                    const move: EncapsuleMove = EncapsuleMove.fromDrop(piece, coord);
                    const status: EncapsuleLegalityStatus = EncapsuleRules.isLegal(move, state);
                    if (status.legal.isSuccess()) {
                        moves.push(move);
                    }
                }
                if (board[y][x].belongsTo(currentPlayer)) {
                    for (let ly: number = 0; ly < 3; ly++) {
                        for (let lx: number = 0; lx < 3; lx++) {
                            const landingCoord: Coord = new Coord(lx, ly);
                            if (!landingCoord.equals(coord)) {
                                const newMove: EncapsuleMove = EncapsuleMove.fromMove(coord, landingCoord);
                                const status: EncapsuleLegalityStatus = EncapsuleRules.isLegal(newMove, state);
                                if (status.legal.isSuccess()) {
                                    moves.push(newMove);
                                }
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }
}
