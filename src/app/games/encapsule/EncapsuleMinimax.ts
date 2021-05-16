import { EncapsulePartSlice, EncapsuleCase } from './EncapsulePartSlice';
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


export class EncapsuleMinimax extends Minimax<EncapsuleMove, EncapsulePartSlice, EncapsuleLegalityStatus> {

    public getBoardValue(move: EncapsuleMove, slice: EncapsulePartSlice): NodeUnheritance {
        let boardValue: number;
        if (EncapsuleRules.isVictory(slice)) {
            boardValue = slice.turn % 2 === 0 ? // TODO test that the real winner wins!
                Number.MAX_SAFE_INTEGER :
                Number.MIN_SAFE_INTEGER;
        } else {
            boardValue = 0;
        }
        return new NodeUnheritance(boardValue);
    }
    public getListMoves(n: EncapsuleNode): EncapsuleMove[] {
        const moves: EncapsuleMove[] = [];
        const slice: EncapsulePartSlice = n.gamePartSlice;
        const board: Table<EncapsuleCase> = slice.toCaseBoard();
        const currentPlayer: Player = slice.getCurrentPlayer();
        const puttablePieces: EncapsulePiece[] = Sets.toComparableObjectSet(slice.getPlayerRemainingPieces());
        for (let y: number = 0; y < 3; y++) {
            for (let x: number = 0; x < 3; x++) {
                const coord: Coord = new Coord(x, y);
                // each drop
                for (const piece of puttablePieces) {
                    const move: EncapsuleMove = EncapsuleMove.fromDrop(piece, coord);
                    const status: EncapsuleLegalityStatus = EncapsuleRules.isLegal(move, slice);
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
                                const status: EncapsuleLegalityStatus = EncapsuleRules.isLegal(newMove, slice);
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
