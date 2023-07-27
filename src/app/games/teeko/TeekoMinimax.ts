import { Minimax } from 'src/app/jscaip/Minimax';
import { TeekoDropMove, TeekoMove, TeekoTranslationMove } from './TeekoMove';
import { TeekoState } from './TeekoState';
import { TeekoNode, TeekoRules } from './TeekoRules';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';

export class TeekoMinimax extends Minimax<TeekoMove, TeekoState, void, BoardValue, TeekoRules> {

    public constructor() {
        super(TeekoRules.get(), 'Teeko Minimax');
    }
    public getListMoves(node: TeekoNode): TeekoMove[] {
        if (node.gameState.isInDropPhase()) {
            return this.getListDrops(node);
        } else {
            return this.getListTranslations(node);
        }
    }
    private getListDrops(node: TeekoNode): TeekoMove[] {
        const moves: TeekoMove[] = [];
        for (const coordAndContent of node.gameState.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            if (node.gameState.getPieceAt(coord).isPlayer() === false) {
                const newMove: TeekoDropMove = TeekoDropMove.from(coord).get();
                moves.push(newMove);
            }
        }
        return moves;
    }
    private getListTranslations(node: TeekoNode): TeekoMove[] {
        const moves: TeekoTranslationMove[] = [];
        const currentPlayer: PlayerOrNone = node.gameState.getCurrentPlayer();
        const listPieces: Coord[] = this.getCoordsContaining(node.gameState, currentPlayer);
        const listEmptySpaces: Coord[] = this.getCoordsContaining(node.gameState, PlayerOrNone.NONE);
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
    public getBoardValue(node: TeekoNode): BoardValue {
        const alignmentPossibities: number = TeekoRules.TEEKO_HELPER.getBoardValue(node.gameState).value;
        if (BoardValue.VICTORIES.some((victory: number) => victory === alignmentPossibities)) {
            return new BoardValue(alignmentPossibities);
        } else {
            const squarePossibilities: {
                score: number;
                victoriousCoords: Coord[];
            } = TeekoRules.get().getSquareInfo(node.gameState);
            if (squarePossibilities.victoriousCoords.length > 0) {
                return BoardValue.fromWinner(node.gameState.getCurrentOpponent());
            } else {
                return new BoardValue(squarePossibilities.score + alignmentPossibities);
            }
        }
    }
}
