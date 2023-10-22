import { GameNode } from 'src/app/jscaip/GameNode';
import { Rules } from 'src/app/jscaip/Rules';
import { TeekoDropMove, TeekoMove, TeekoTranslationMove } from './TeekoMove';
import { TeekoState } from './TeekoState';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { Utils } from 'src/app/utils/utils';
import { Coord } from 'src/app/jscaip/Coord';

export class TeekoNode extends GameNode<TeekoMove, TeekoState> {}

export class TeekoRules extends Rules<TeekoMove, TeekoState> {

    private static singleton: MGPOptional<TeekoRules> = MGPOptional.empty();

    public static readonly TEEKO_HELPER: NInARowHelper<PlayerOrNone> =
        new NInARowHelper(TeekoState.isOnBoard, Utils.identity, 4);

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
        if (state.isInDropPhase()) {
            return this.isLegalDrop(move, state);
        } else {
            return this.isLegalTranslation(move, state);
        }
    }
    private isLegalDrop(move: TeekoMove, state: TeekoState): MGPValidation {
        Utils.assert(move instanceof TeekoDropMove, 'Cannot translate in dropping phase !');
        const drop: TeekoDropMove = move as TeekoDropMove;
        if (state.getPieceAt(drop.coord).isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        return MGPValidation.SUCCESS;
    }
    private isLegalTranslation(move: TeekoMove, state: TeekoState): MGPValidation {
        Utils.assert(move instanceof TeekoTranslationMove, 'Cannot drop in translation phase !');
        const translation: TeekoTranslationMove = move as TeekoTranslationMove;
        const currentOpponent: Player = state.getCurrentOpponent();
        if (state.getPieceAt(translation.getStart()) === currentOpponent) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
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
    private applyLegalTranslate(move: TeekoTranslationMove, state: TeekoState): TeekoState {
        const newBoard: PlayerOrNone[][] = state.getCopiedBoard();
        newBoard[move.getStart().y][move.getStart().x] = PlayerOrNone.NONE;
        newBoard[move.getEnd().y][move.getEnd().x] = state.getCurrentPlayer();
        return new TeekoState(newBoard, state.turn + 1);
    }
    public getGameStatus(node: TeekoNode): GameStatus {
        const state: TeekoState = node.gameState;
        const victoriousCoord: Coord[] = this.getVictoryCoord(state);
        if (victoriousCoord.length > 0) {
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
        const possibilies: [number, number] = [0, 0];
        for (let cx: number = 0; cx < TeekoState.WIDTH - 1; cx++) {
            for (let cy: number = 0; cy < TeekoState.WIDTH - 1; cy++) {
                const upLeft: Coord = new Coord(cx, cy);
                const upRight: Coord = new Coord(cx + 1, cy);
                const downLeft: Coord = new Coord(cx, cy + 1);
                const downRight: Coord = new Coord(cx + 1, cy + 1);
                const pieces: PlayerOrNone[] = [
                    state.getPieceAt(upLeft),
                    state.getPieceAt(upRight),
                    state.getPieceAt(downLeft),
                    state.getPieceAt(downRight),
                ];
                const neutralCount: number = this.count(pieces, PlayerOrNone.NONE);
                const zeroCount: number = this.count(pieces, PlayerOrNone.ZERO);
                const oneCount: number = this.count(pieces, PlayerOrNone.ONE);
                if (neutralCount < 4) { // If the square has pieces
                    if (zeroCount === 4 || oneCount === 4) { // There is one player who won, in this square
                        victoriousCoords.push(upLeft, upRight, downLeft, downRight);
                    }
                    else if (zeroCount > 0) { // Only Player.ZERO has piece in this square
                        possibilies[0] = possibilies[0] + 1;
                    } else { // Only Player.ONE has piece in this square
                        possibilies[1] = possibilies[1] + 1;
                    }
                }
            }
        }
        return {
            score: possibilies[1] - possibilies[0],
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
        // Concatenate line victories to square victories
        const linesVictories: Coord[] = TeekoRules.TEEKO_HELPER.getVictoriousCoord(state);
        linesVictories.push(...this.getSquareInfo(state).victoriousCoords);
        return linesVictories;
    }
}
