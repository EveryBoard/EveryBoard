import { MoveGenerator } from 'src/app/jscaip/AI';
import { DiaballikMove, DiaballikBallPass, DiaballikSubMove, DiaballikTranslation } from './DiaballikMove';
import { DiaballikPiece, DiaballikState } from './DiaballikState';
import { DiaballikNode, DiaballikRules } from './DiaballikRules';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Coord } from 'src/app/jscaip/Coord';
import { Direction, Orthogonal } from 'src/app/jscaip/Direction';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class DiaballikMoveInConstruction {

    public readonly hasPass: boolean;
    public readonly translations: number;

    public constructor(public readonly subMoves: DiaballikSubMove[],
                       public readonly stateBefore: DiaballikState,
                       public readonly stateAfterSubMoves: DiaballikState) {
        Utils.assert(this.subMoves.length <= 3, 'DiaballikMoveInConstruction can have at most 3 submoves');
        let hasPass: boolean = false;
        let translations: number = 0;
        for (const subMove of subMoves) {
            if (subMove instanceof DiaballikBallPass) {
                Utils.assert(hasPass === false, 'DiaballikMoveInConstruction can have at moste one pass');
                hasPass = true;
            } else {
                Utils.assert(translations < 2, 'DiaballikMoveInConstruction can have at most two translations');
                translations++;
            }
        }
        this.hasPass = hasPass;
        this.translations = translations;
    }

    public addIfLegal(subMove: DiaballikSubMove, listToAddTo: DiaballikMoveInConstruction[]): void {
        const legality: MGPFallible<DiaballikState> =
            DiaballikRules.get().isLegalSubMove(this.stateAfterSubMoves, subMove);
        if (legality.isSuccess()) {
            const newMoveInConstruction: DiaballikMoveInConstruction =
                new DiaballikMoveInConstruction(this.subMoves.concat([subMove]), this.stateBefore, legality.get());
            listToAddTo.push(newMoveInConstruction);
        }
    }

    public getPassEnd(): MGPOptional<Coord> {
        for (const subMove of this.subMoves) {
            if (subMove instanceof DiaballikBallPass) {
                return MGPOptional.of(subMove.getEnd());
            }
        }
        return MGPOptional.empty();
    }

    public getPreviousTranslation(): MGPOptional<DiaballikTranslation> {
        for (const subMove of this.subMoves) {
            if (subMove instanceof DiaballikTranslation) {
                return MGPOptional.of(subMove);
            }
        }
        return MGPOptional.empty();
    }

    public finalize(): DiaballikMove {
        Utils.assert(this.subMoves.length > 0, 'DiaballikMoveInConstruction can only be finalized if it contains something');
        const first: DiaballikSubMove = this.subMoves[0];
        let second: MGPOptional<DiaballikSubMove> = MGPOptional.empty();
        if (this.subMoves.length > 1) {
            second = MGPOptional.of(this.subMoves[1]);
        }
        let third: MGPOptional<DiaballikSubMove> = MGPOptional.empty();
        if (this.subMoves.length > 2) {
            third = MGPOptional.of(this.subMoves[2]);
        }
        const move: DiaballikMove = new DiaballikMove(first, second, third);
        Utils.assert(DiaballikRules.get().isLegal(move, this.stateBefore).isSuccess(),
                     'DiaballikMoveGenerator should only generate legal moves');
        return move;
    }
}


export class DiaballikMoveGenerator extends MoveGenerator<DiaballikMove, DiaballikState> {

    public getListMoves(node: DiaballikNode): DiaballikMove[] {
        function finalize(m: DiaballikMoveInConstruction): DiaballikMove {
            return m.finalize();
        }
        const emptyMove: DiaballikMoveInConstruction =
            new DiaballikMoveInConstruction([], node.gameState, node.gameState);
        let movesInConstruction: DiaballikMoveInConstruction[] = [emptyMove];
        let moves: DiaballikMove[] = [];
        for (let i: number = 0; i < 3; i++) {
            let nextMovesInConstruction: DiaballikMoveInConstruction[] = [];
            for (const move of movesInConstruction) {
                const newMovesInConstruction: DiaballikMoveInConstruction[] = this.addAllPossibleSubMoves(move);
                moves = moves.concat(newMovesInConstruction.map(finalize));
                nextMovesInConstruction = nextMovesInConstruction.concat(newMovesInConstruction);
            }
            movesInConstruction = nextMovesInConstruction;
        }

        return moves;

    }

    protected addAllPossibleSubMoves(moveInConstruction: DiaballikMoveInConstruction): DiaballikMoveInConstruction[] {
        const state: DiaballikState = moveInConstruction.stateAfterSubMoves;
        const player: Player = state.getCurrentPlayer();
        const nextMovesInConstruction: DiaballikMoveInConstruction[] = [];
        for (const coordAndContent of state.getCoordsAndContents()) {
            const coord: Coord = coordAndContent.coord;
            const piece: DiaballikPiece = coordAndContent.content;
            if (piece.owner === player) {
                if (piece.holdsBall && moveInConstruction.hasPass === false) {
                    // Note: we can only do one pass per turn, hence the check on hasPass
                    for (const end of this.getPassEnds(state, coordAndContent.coord)) {
                        // The pass here is valid by construction
                        const pass: DiaballikBallPass = DiaballikBallPass.from(coord, end).get();
                        moveInConstruction.addIfLegal(pass, nextMovesInConstruction);
                    }
                } else {
                    // Can only do two translations per move
                    const hasLessThanTwoTranslations: boolean = moveInConstruction.translations < 2;
                    // If there was a pass, we ignore other pieces than the one that has made the pass
                    // The reasoning is that any other translation could have been done before the pass,
                    // hence they are not interesting to generate.
                    const hasPassAndIsPieceThatPassed: boolean =
                        moveInConstruction.hasPass && moveInConstruction.getPassEnd().equalsValue(coord);
                    if (hasLessThanTwoTranslations || hasPassAndIsPieceThatPassed) {
                        let forbiddenEnd: MGPOptional<Coord> = MGPOptional.empty();
                        if (moveInConstruction.translations > 0) {
                            const previousTranslation: DiaballikTranslation =
                                moveInConstruction.getPreviousTranslation().get();
                            if (previousTranslation.getEnd().equals(coord)) {
                                forbiddenEnd = MGPOptional.of(previousTranslation.getStart());
                            }
                        }
                        for (const end of this.getTranslationEnds(state, coordAndContent.coord)) {
                            // We ignore the forbidden end because it is the opposite
                            // of the previous translation, hence it a no-op
                            if (forbiddenEnd.equalsValue(end) === false) {
                                // The translation here is valid and legal by construction
                                const translation: DiaballikTranslation = DiaballikTranslation.from(coord, end).get();
                                moveInConstruction.addIfLegal(translation, nextMovesInConstruction);
                            }
                        }
                    }
                }
            }
        }
        return nextMovesInConstruction;
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
