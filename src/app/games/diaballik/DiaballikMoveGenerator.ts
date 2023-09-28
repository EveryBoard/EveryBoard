import { MoveGenerator } from 'src/app/jscaip/AI';
import { DiaballikMove, DiaballikPass, DiaballikSubMove, DiaballikTranslation } from './DiaballikMove';
import { DiaballikPiece, DiaballikState } from './DiaballikState';
import { DiaballikNode, DiaballikRules } from './DiaballikRules';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction, Orthogonal } from 'src/app/jscaip/Direction';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class DiaballikMoveGenerator extends MoveGenerator<DiaballikMove, DiaballikState> {

    public getListMoves(node: DiaballikNode): DiaballikMove[] {
        const moves: DiaballikMove[] = [];
        // We only generate moves that have 3 submoves.
        // The reasoning is that it is super rare to not want 3 submoves.
        const state: DiaballikState = node.gameState;
        for (const first of this.getListSubMoves(state)) {
            const firstLegality: MGPFallible<DiaballikState> =
                DiaballikRules.get().isLegalSubMove(state, first);
            if (firstLegality.isSuccess()) {
                const stateAfterFirst: DiaballikState = firstLegality.get();
                for (const second of this.getListSubMoves(stateAfterFirst)) {
                    const secondLegality: MGPFallible<DiaballikState> =
                        DiaballikRules.get().isLegalSubMove(state, second);
                    if (secondLegality.isSuccess()) {
                        const stateAfterSecond: DiaballikState = secondLegality.get();
                        for (const third of this.getListSubMoves(stateAfterSecond)) {
                            const thirdLegality: MGPFallible<DiaballikState> =
                                DiaballikRules.get().isLegalSubMove(state, third);
                            if (thirdLegality.isSuccess()) {
                                moves.push(new DiaballikMove(first, MGPOptional.of(second), MGPOptional.of(third)));
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }

    private getListSubMoves(state: DiaballikState): DiaballikSubMove[] {
        const player: Player = state.getCurrentPlayer();
        const subMoves: DiaballikSubMove[] = [];
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            const piece: DiaballikPiece = coordAndContent.content;
            if (piece.owner === player) {
                if (piece.holdsBall) {
                    for (const end of this.getPassEnds(state, coordAndContent.coord)) {
                        // The pass here is valid by construction
                        subMoves.push(DiaballikPass.from(coord, end).get());
                    }
                } else {
                    for (const end of this.getTranslationEnds(state, coordAndContent.coord)) {
                        // The translation here is valid by construction
                        subMoves.push(DiaballikTranslation.from(coord, end).get());
                    }
                }
            }
        }
        return subMoves;
    }

    /**
     * Returns all legal pass ends for a pass starting at start
     */
    public getPassEnds(state: DiaballikState, start: Coord): Coord[] {
        const player: Player = state.getCurrentPlayer();
        const ends: Coord[] = [];
        // A pass is in any direction, as long as it reaches a player piece and is not obstructed
        for (const direction of Direction.factory.all) {
            let coord: Coord = start.getNext(direction);
            while (DiaballikState.isOnBoard(coord)) {
                const piece: DiaballikPiece = state.getPieceAt(coord);
                if (piece.owner === player) {
                    ends.push(coord);
                    break;
                } else if (piece.owner !== PlayerOrNone.NONE) {
                    // This pass is obstructed
                    break;
                }
                coord = coord.getNext(direction);
            }
        }
        return ends;
    }

    /**
     * Returns all legal translation ends for a translation starting at start
     */
    public getTranslationEnds(state: DiaballikState, start: Coord): Coord[] {
        const ends: Coord[] = [];
        // A legal translation is an orthogonal translation that ends on an empty space
        for (const direction of Orthogonal.factory.all) {
            const end: Coord = start.getNext(direction);
            if (DiaballikState.isOnBoard(end) && state.getPieceAt(end).owner === PlayerOrNone.NONE) {
                ends.push(end);
            }
        }
        return ends;
    }
}
