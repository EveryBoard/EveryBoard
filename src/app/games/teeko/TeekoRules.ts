import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Rules } from 'src/app/jscaip/Rules';
import { TeekoDropMove, TeekoMove, TeekoTranslateMove } from './TeekoMove';
import { TeekoState } from './TeekoState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { Utils } from 'src/app/utils/utils';
import { Coord } from 'src/app/jscaip/Coord';

export class TeekoNode extends MGPNode<Rules<TeekoMove, TeekoState>, TeekoMove, TeekoState> {}

export class TeekoRules extends Rules<TeekoMove, TeekoState> {

    private static singleton: MGPOptional<TeekoRules> = MGPOptional.empty();

    public static readonly TEEKO_HELPER: NInARowHelper<PlayerOrNone> =
        new NInARowHelper(TeekoMove.isInRange, Utils.identity, 4);

    public static get(): TeekoRules {
        if (TeekoRules.singleton.isAbsent()) {
            TeekoRules.singleton = MGPOptional.of(new TeekoRules());
        }
        return TeekoRules.singleton.get();
    }
    private constructor() {
        super(TeekoState);
    }
    public isLegal(move: TeekoMove, state: TeekoState): MGPValidation {
        if (state.turn < 8) {
            return this.isLegalDrop(move, state);
        } else {
            return this.isLegalTranslation(move, state);
        }
    }
    private isLegalDrop(move: TeekoMove, state: TeekoState): MGPValidation {
        Utils.assert(move instanceof TeekoDropMove, 'CANNOT_TRANSLATE_IN_DROPPING_PHASE');
        const drop: TeekoDropMove = move as TeekoDropMove;
        if (state.getPieceAt(drop.coord).isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        return MGPValidation.SUCCESS;
    }
    private isLegalTranslation(move: TeekoMove, state: TeekoState): MGPValidation {
        Utils.assert(move instanceof TeekoTranslateMove, 'CANNOT_DROP_IN_TRANSLATING_PHASE');
        const translation: TeekoTranslateMove = move as TeekoTranslateMove;
        const currentOpponent: Player = state.getCurrentOpponent();
        if (state.getPieceAt(translation.getStart()) === currentOpponent) {
            return MGPValidation.failure(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        } else if (state.getPieceAt(translation.getStart()) === PlayerOrNone.NONE) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        if (state.getPieceAt(translation.getEnd()).isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        return MGPValidation.SUCCESS;
    }
    public applyLegalMove(move: TeekoMove, state: TeekoState): TeekoState {
        if (move instanceof TeekoDropMove) {
            return this.applyLegalDrop(move, state);
        } else {
            return this.applyLegalTranslate(move, state);
        }
    }
    private applyLegalDrop(move: TeekoDropMove, state: TeekoState): TeekoState {
        const newBoard: PlayerOrNone[][] = state.getCopiedBoard();
        newBoard[move.coord.y][move.coord.x] = state.getCurrentPlayer();
        return new TeekoState(newBoard, state.turn + 1);
    }
    private applyLegalTranslate(move: TeekoTranslateMove, state: TeekoState): TeekoState {
        const newBoard: PlayerOrNone[][] = state.getCopiedBoard();
        newBoard[move.getStart().y][move.getStart().x] = PlayerOrNone.NONE;
        newBoard[move.getEnd().y][move.getEnd().x] = state.getCurrentPlayer();
        return new TeekoState(newBoard, state.turn + 1);
    }
    public getGameStatus(node: TeekoNode): GameStatus {
        const state: TeekoState = node.gameState;
        const victoriousCoord: Coord[] = TeekoRules.TEEKO_HELPER.getVictoriousCoord(state);
        if (victoriousCoord.length > 0) {
            return GameStatus.getVictory(state.getCurrentOpponent());
        } else if (this.getSquareInfo(node.gameState).victoriousCoords.length > 0) {
            return GameStatus.getVictory(state.getCurrentOpponent());
        } else {
            return GameStatus.ONGOING;
        }
    }
    public getLastCoord(move: TeekoMove): Coord {
        if (move instanceof TeekoDropMove) {
            return move.coord;
        } else {
            return move.getEnd();
        }
    }
    public getSquareInfo(state: TeekoState): { score: number, victoriousCoords: Coord[] } {
        const victoriousCoords: Coord[] = [];
        let zeroSquarePossibilities: number = 0;
        let oneSquarePossibilities: number = 0;
        for (let cx: number = 0; cx < 3; cx++) {
            for (let cy: number = 0; cy < 3; cy++) {
                const upLeft: Coord = new Coord(cx, cy);
                const upRight: Coord = new Coord(cx + 1, cy);
                const downLeft: Coord = new Coord(cx, cy + 1);
                const downRight: Coord = new Coord(cx + 1, cy + 1);
                const upLeftPiece: PlayerOrNone = state.getPieceAt(upLeft);
                const upRightPiece: PlayerOrNone = state.getPieceAt(upRight);
                const downLeftPiece: PlayerOrNone = state.getPieceAt(downLeft);
                const downRightPiece: PlayerOrNone = state.getPieceAt(downRight);
                const pieces: PlayerOrNone[] = [upLeftPiece, upRightPiece, downLeftPiece, downRightPiece];
                const neutralCount: number = this.count(pieces, PlayerOrNone.NONE);
                const zeroCount: number = this.count(pieces, PlayerOrNone.ZERO);
                const oneCount: number = this.count(pieces, PlayerOrNone.ONE);
                if (neutralCount === 4) {
                    continue;
                } else if (zeroCount + neutralCount === 4) {
                    if (neutralCount === 0) {
                        victoriousCoords.push(upLeft, upRight, downLeft, downRight);
                    }
                    zeroSquarePossibilities++;
                } else if (oneCount + neutralCount === 4) {
                    if (neutralCount === 0) {
                        victoriousCoords.push(upLeft, upRight, downLeft, downRight);
                    }
                    oneSquarePossibilities++;
                }
            }
        }
        return {
            score: oneSquarePossibilities - zeroSquarePossibilities,
            victoriousCoords,
        };
    }
    private count(pieces: PlayerOrNone[], value: PlayerOrNone): number {
        let total: number = 0;
        for (const piece of pieces) {
            if (piece === value) {
                total++;
            }
        }
        return total;
    }
    public getVictoryCoord(state: TeekoState): Coord[] {
        const victories: Coord[] = TeekoRules.TEEKO_HELPER.getVictoriousCoord(state);
        victories.push(...this.getSquareInfo(state).victoriousCoords);
        return victories;
    }
}
