import { Coord } from 'src/app/jscaip/Coord';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { Table, TableUtils } from 'src/app/jscaip/TableUtils';
import { ArrayUtils, MGPValidation, MGPOptional, Utils } from '@everyboard/lib';
import { DiamFailure } from './DiamFailure';
import { DiamMove, DiamMoveDrop, DiamMoveShift } from './DiamMove';
import { DiamPiece } from './DiamPiece';
import { DiamState } from './DiamState';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class DiamNode extends GameNode<DiamMove, DiamState> {}

export class DiamRules extends Rules<DiamMove, DiamState> {

    private static singleton: MGPOptional<DiamRules> = MGPOptional.empty();

    public static get(): DiamRules {
        if (DiamRules.singleton.isAbsent()) {
            DiamRules.singleton = MGPOptional.of(new DiamRules());
        }
        return DiamRules.singleton.get();
    }

    public override getInitialState(): DiamState {
        const _: DiamPiece = DiamPiece.EMPTY;
        const board: Table<DiamPiece> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ];
        return new DiamState(board, [4, 4, 4, 4], 0);
    }

    public override applyLegalMove(move: DiamMove, state: DiamState, _config: NoConfig, _info: void): DiamState {
        if (move.isDrop()) {
            return this.applyLegalDrop(move, state);
        } else {
            return this.applyLegalShift(move as DiamMoveShift, state);
        }
    }

    private applyLegalDrop(drop: DiamMoveDrop, state: DiamState): DiamState {
        const newBoard: DiamPiece[][] = TableUtils.copy(state.board);
        newBoard[state.getStackHeight(drop.target)][drop.target] = drop.piece;
        const newRemainingPieces: [number, number, number, number] =
            ArrayUtils.copy(state.remainingPieces) as [number, number, number, number];
        newRemainingPieces[DiamState.pieceIndex(drop.piece)] -= 1;
        return new DiamState(newBoard, newRemainingPieces, state.turn + 1);
    }

    private applyLegalShift(shift: DiamMoveShift, state: DiamState): DiamState {
        const newBoard: DiamPiece[][] = TableUtils.copy(state.board);
        const targetX: number = shift.getTarget();
        let targetY: number = state.getStackHeight(targetX);
        let sourceY: number = shift.start.y;
        while (sourceY < DiamState.HEIGHT && state.getPieceAtXY(shift.start.x, sourceY) !== DiamPiece.EMPTY) {
            newBoard[targetY][targetX] = state.getPieceAtXY(shift.start.x, sourceY);
            newBoard[sourceY][shift.start.x] = DiamPiece.EMPTY;
            targetY++;
            sourceY++;
        }
        return new DiamState(newBoard, state.remainingPieces, state.turn + 1);
    }

    public override isLegal(move: DiamMove, state: DiamState): MGPValidation {
        if (move.isDrop()) {
            return this.isDropLegal(move, state);
        } else {
            return this.isShiftLegal(move as DiamMoveShift, state);
        }
    }

    private isDropLegal(drop: DiamMoveDrop, state: DiamState): MGPValidation {
        Utils.assert(drop.target < DiamState.WIDTH, 'DiamMoveDrop out of board');
        Utils.assert(drop.piece.owner !== PlayerOrNone.NONE, 'DiamMoveDrop cannot contain an empty piece');
        if (drop.piece.owner === state.getCurrentOpponent()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        if (state.getRemainingPiecesOf(drop.piece) === 0) {
            return MGPValidation.failure(DiamFailure.NO_MORE_PIECES_OF_THIS_TYPE());
        }
        return this.dropHeightValidity(drop, state);
    }

    public dropHeightValidity(drop: DiamMoveDrop, state: DiamState): MGPValidation {
        if (state.getStackHeight(drop.target) === DiamState.HEIGHT) {
            return MGPValidation.failure(DiamFailure.SPACE_IS_FULL());
        }
        return MGPValidation.SUCCESS;
    }

    private isShiftLegal(shift: DiamMoveShift, state: DiamState): MGPValidation {
        const piece: DiamPiece = state.getPieceAt(shift.start);
        if (piece.owner.isNone()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        if (piece.owner === state.getCurrentOpponent()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        return this.shiftHeightValidity(shift, state);
    }

    public shiftHeightValidity(shift: DiamMoveShift, state: DiamState): MGPValidation {
        const movedHeight: number = state.getStackHeight(shift.start.x) - shift.start.y;
        const resultingHeight: number = state.getStackHeight(shift.getTarget()) + movedHeight;
        if (resultingHeight > DiamState.HEIGHT) {
            return MGPValidation.failure(DiamFailure.TARGET_STACK_TOO_HIGH());
        }
        return MGPValidation.SUCCESS;
    }

    public override getGameStatus(node: DiamNode): GameStatus {
        const highestAlignment: MGPOptional<Coord> = this.findHighestAlignment(node.gameState);
        if (highestAlignment.isPresent()) {
            const winningPiece: DiamPiece = node.gameState.getPieceAt(highestAlignment.get());
            Utils.assert(winningPiece.owner.isPlayer(), 'highest alignment is owned by a player');
            return GameStatus.getVictory(winningPiece.owner as Player);
        } else {
            return GameStatus.ONGOING;
        }
    }

    public findHighestAlignment(state: DiamState): MGPOptional<Coord> {
        for (let x: number = 0; x < DiamState.WIDTH/2; x++) {
            for (let y: number = DiamState.HEIGHT-1; y > 0; y--) { // skip 0 because ground alignment isn't a win
                const pieceHere: DiamPiece = state.getPieceAtXY(x, y);
                const pieceThere: DiamPiece = state.getPieceAtXY(x+(DiamState.WIDTH/2), y);
                if (pieceHere !== DiamPiece.EMPTY && pieceHere === pieceThere ) {
                    return MGPOptional.of(new Coord(x, y));
                }
            }
        }
        return MGPOptional.empty();
    }

    public pieceCanMove(state: DiamState, coord: Coord): boolean {
        if (this.isShiftLegal(new DiamMoveShift(coord, 'clockwise'), state).isSuccess()) {
            return true;
        } else if (this.isShiftLegal(new DiamMoveShift(coord, 'counterclockwise'), state).isSuccess()) {
            return true;
        } else {
            return false;
        }
    }

}
