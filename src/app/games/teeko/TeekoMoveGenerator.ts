import { TeekoDropMove, TeekoMove, TeekoTranslationMove } from './TeekoMove';
import { TeekoState } from './TeekoState';
import { TeekoNode } from './TeekoRules';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';

export class TeekoMoveGenerator extends MoveGenerator<TeekoMove, TeekoState> {

    public getListMoves(node: TeekoNode): TeekoMove[] {
        if (node.gameState.isInDropPhase()) {
            return this.getListDrops(node.gameState);
        } else {
            return this.getListTranslations(node.gameState);
        }
    }
    private getListDrops(state: TeekoState): TeekoMove[] {
        const moves: TeekoMove[] = [];
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            if (state.getPieceAt(coord).isPlayer() === false) {
                const newMove: TeekoDropMove = TeekoDropMove.from(coord).get();
                moves.push(newMove);
            }
        }
        return moves;
    }
    private getListTranslations(state: TeekoState): TeekoMove[] {
        const moves: TeekoTranslationMove[] = [];
        const currentPlayer: PlayerOrNone = state.getCurrentPlayer();
        const listPieces: Coord[] = this.getCoordsContaining(state, currentPlayer);
        const listEmptySpaces: Coord[] = this.getCoordsContaining(state, PlayerOrNone.NONE);
        for (const piece of listPieces) {
            for (const emptySpace of listEmptySpaces) {
                const newMove: TeekoTranslationMove = TeekoTranslationMove.from(piece, emptySpace).get();
                moves.push(newMove);
            }
        }
        return moves;
    }
    private getCoordsContaining(state: TeekoState, piece: PlayerOrNone): Coord[] {
        const coords: Coord[] = [];
        for (const coordAndContent of state.getCoordsAndContents()) {
            if (coordAndContent.content === piece) {
                coords.push(coordAndContent.coord);
            }
        }
        return coords;
    }
}
