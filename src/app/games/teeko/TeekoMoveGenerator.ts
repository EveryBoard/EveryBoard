import { TeekoDropMove, TeekoMove, TeekoTranslationMove } from './TeekoMove';
import { TeekoState } from './TeekoState';
import { TeekoNode, TeekoRules } from './TeekoRules';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MoveGenerator } from 'src/app/jscaip/AI';
import { Direction } from 'src/app/jscaip/Direction';

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
            if (coordAndContent.content.isPlayer() === false) {
                const newMove: TeekoDropMove = TeekoDropMove.from(coord).get();
                moves.push(newMove);
            }
        }
        return moves;
    }
    private getListTranslations(state: TeekoState): TeekoMove[] {
        const moves: TeekoTranslationMove[] = [];
        const currentPlayer: PlayerOrNone = state.getCurrentPlayer();
        const piecePositions: Coord[] = this.getCoordsContaining(state, currentPlayer);
        for (const start of piecePositions) {
            for (const target of this.getPossibleTargets(state, start)) {
                const newMove: TeekoTranslationMove = TeekoTranslationMove.from(start, target).get();
                moves.push(newMove);
            }
        }
        return moves;
    }
    private getPossibleTargets(state: TeekoState, start: Coord): Coord[] {
        if (TeekoRules.CAN_TELEPORT) {
            return this.getCoordsContaining(state, PlayerOrNone.NONE);
        } else {
            const possibleTargets: Coord[] = [];
            for (const direction of Direction.factory.all) {
                const target: Coord = start.getNext(direction);
                if (TeekoState.isOnBoard(target) && state.getPieceAt(target) === PlayerOrNone.NONE) {
                    possibleTargets.push(target);
                }
            }
            return possibleTargets;
        }
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
