import { Heuristic, Minimax } from 'src/app/jscaip/Minimax';
import { TeekoDropMove, TeekoMove, TeekoTranslationMove } from './TeekoMove';
import { TeekoState } from './TeekoState';
import { TeekoNode, TeekoRules } from './TeekoRules';
import { BoardValue } from 'src/app/jscaip/BoardValue';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MoveGenerator } from 'src/app/jscaip/MGPNode';
import { GameStatus } from 'src/app/jscaip/GameStatus';

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

export class TeekoHeuristic extends Heuristic<TeekoMove, TeekoState> {

    public getBoardValue(node: TeekoNode): BoardValue {
        const alignmentPossibities: number = TeekoRules.TEEKO_HELPER.getBoardValue(node.gameState).value;
        const squarePossibilities: { score: number; victoriousCoords: Coord[] } =
            TeekoRules.get().getSquareInfo(node.gameState);
        return new BoardValue(squarePossibilities.score + alignmentPossibities);
    }
}

export class TeekoMinimax extends Minimax<TeekoMove, TeekoState> {

    public constructor() {
        super('Minimax', TeekoRules.get(), new TeekoHeuristic(), new TeekoMoveGenerator())
    }
}
