import { TeekoDropMove, TeekoMove, TeekoTranslationMove } from './TeekoMove';
import { TeekoState } from './TeekoState';
import { TeekoConfig, TeekoNode } from './TeekoRules';
import { Coord } from 'src/app/jscaip/Coord';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { MoveGenerator } from 'src/app/jscaip/AI';
import { Direction } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class TeekoMoveGenerator extends MoveGenerator<TeekoMove, TeekoState, TeekoConfig> {

    public getListMoves(node: TeekoNode, config: MGPOptional<TeekoConfig>): TeekoMove[] {
        if (node.gameState.isInDropPhase()) {
            return this.getListDrops(node.gameState);
        } else {
            return this.getListTranslations(node.gameState, config.get());
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

    private getListTranslations(state: TeekoState, config: TeekoConfig): TeekoMove[] {
        const moves: TeekoTranslationMove[] = [];
        const currentPlayer: PlayerOrNone = state.getCurrentPlayer();
        const piecePositions: Coord[] = this.getCoordsContaining(state, currentPlayer);
        for (const start of piecePositions) {
            for (const target of this.getPossibleTargets(state, start, config)) {
                const newMove: TeekoTranslationMove = TeekoTranslationMove.from(start, target).get();
                moves.push(newMove);
            }
        }
        return moves;
    }

    private getPossibleTargets(state: TeekoState, start: Coord, config: TeekoConfig): Coord[] {
        if (config.teleport) {
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
