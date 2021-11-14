import { Coord } from 'src/app/jscaip/Coord';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { DiamFailure } from './DiamFailure';
import { DiamMove, DiamMoveDrop, DiamMoveShift } from './DiamMove';
import { DiamPiece } from './DiamPiece';
import { DiamState } from './DiamState';

export class DiamNode extends MGPNode<DiamRules, DiamMove, DiamState, LegalityStatus> {}

export class DiamRules extends Rules<DiamMove, DiamState, LegalityStatus> {

    public static readonly singleton: DiamRules = new DiamRules(DiamState);

    public applyLegalMove(move: DiamMove, state: DiamState, _status: LegalityStatus): DiamState {
        if (move.isDrop()) {
            return this.applyLegalDrop(move, state);
        } else {
            return this.applyLegalShift(move, state);
        }
    }
    private applyLegalDrop(drop: DiamMoveDrop, state: DiamState): DiamState {
        const newBoard: DiamPiece[][] = ArrayUtils.copyBiArray(state.board);
        newBoard[3-state.getStackHeight(drop.target)][drop.target] = drop.piece;
        const newRemainingPieces: [number, number, number, number] =
            ArrayUtils.copyImmutableArray(state.remainingPieces) as [number, number, number, number];
        newRemainingPieces[DiamState.pieceIndex(drop.piece)] -= 1;
        return new DiamState(newBoard, newRemainingPieces, state.turn+1);
    }
    private applyLegalShift(shift: DiamMoveShift, state: DiamState): DiamState {
        const newBoard: DiamPiece[][] = ArrayUtils.copyBiArray(state.board);
        const targetX: number = shift.getTarget();
        let targetY: number = state.getStackHeight(targetX)-1;
        let sourceY: number = shift.start.y;
        while (sourceY > 0 && state.getPieceAtXY(shift.start.x, sourceY) !== DiamPiece.EMPTY) {
            newBoard[targetY][targetX] = state.getPieceAtXY(shift.start.x, sourceY);
            newBoard[sourceY][shift.start.x] = DiamPiece.EMPTY;
            targetY--;
            sourceY--;
        }
        return new DiamState(newBoard, state.remainingPieces, state.turn+1);
    }
    public isLegal(move: DiamMove, state: DiamState): LegalityStatus {
        if (move.isDrop()) {
            return this.isDropLegal(move, state);
        } else {
            return this.isShiftLegal(move, state);
        }
    }
    private isDropLegal(drop: DiamMoveDrop, state: DiamState): LegalityStatus {
        // DiamMoveDrop can only be created on a space on the board, so we don't have to check that
        if (drop.piece.owner !== state.getCurrentPlayer()) {
            return LegalityStatus.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        if (state.getRemainingPiecesOf(drop.piece) === 0) {
            return LegalityStatus.failure(DiamFailure.NO_MORE_PIECES_OF_THIS_TYPE());
        }
        if (state.getStackHeight(drop.target) === 4) {
            return LegalityStatus.failure(DiamFailure.STACK_IS_FULL());
        }
        return LegalityStatus.SUCCESS;
    }
    private isShiftLegal(shift: DiamMoveShift, state: DiamState): LegalityStatus {
        if (state.getPieceAt(shift.start).owner !== state.getCurrentPlayer()) {
            return LegalityStatus.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        const resultingHeight: number =
            // the height of the stack we move
            state.getStackHeight(shift.start.x - (3 - shift.start.y)) +
            // the hegiht of the target
            state.getStackHeight(shift.getTarget());
        if (resultingHeight > 4) {
            return LegalityStatus.failure(DiamFailure.TARGET_STACK_TOO_HIGH());
        }
        return LegalityStatus.SUCCESS;
    }
    public getGameStatus(node: DiamNode): GameStatus {
        const highestAlignment: MGPOptional<Coord> = this.findHighestAlignment(node.gameState);
        if (highestAlignment.isPresent()) {
            const winningPiece: DiamPiece = node.gameState.getPieceAt(highestAlignment.get());
            return GameStatus.getVictory(winningPiece.owner);
        } else {
            return GameStatus.ONGOING;
        }
    }
    private findHighestAlignment(state: DiamState): MGPOptional<Coord> {
        for (let x: number = 0; x < 4; x++) {
            for (let y: number = 0; y < 3; y++) { // skip y = 3 because ground alignment isn't a win
                const pieceHere: DiamPiece = state.getPieceAtXY(x, y);
                const pieceThere: DiamPiece = state.getPieceAtXY(x+4, y);
                if (pieceHere !== DiamPiece.EMPTY && pieceHere === pieceThere ) {
                    return MGPOptional.of(new Coord(x, y));
                }
            }
        }
        return MGPOptional.empty();
    }
}
