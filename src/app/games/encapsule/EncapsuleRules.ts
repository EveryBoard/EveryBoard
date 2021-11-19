import { GameStatus, Rules } from '../../jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { EncapsuleState, EncapsuleCase } from './EncapsuleState';
import { Coord } from 'src/app/jscaip/Coord';
import { Player } from 'src/app/jscaip/Player';
import { display } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsulePiece } from './EncapsulePiece';
import { EncapsuleFailure } from './EncapsuleFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export type EncapsuleLegalityInformation = EncapsuleCase;

export class EncapsuleNode
    extends MGPNode<EncapsuleRules, EncapsuleMove, EncapsuleState, EncapsuleLegalityInformation> {}

export class EncapsuleRules extends Rules<EncapsuleMove, EncapsuleState, EncapsuleLegalityInformation> {

    public static readonly LINES: Coord[][] = [
        [new Coord(0, 0), new Coord(0, 1), new Coord(0, 2)],
        [new Coord(1, 0), new Coord(1, 1), new Coord(1, 2)],
        [new Coord(2, 0), new Coord(2, 1), new Coord(2, 2)],
        [new Coord(0, 0), new Coord(1, 0), new Coord(2, 0)],
        [new Coord(0, 1), new Coord(1, 1), new Coord(2, 1)],
        [new Coord(0, 2), new Coord(1, 2), new Coord(2, 2)],
        [new Coord(0, 0), new Coord(1, 1), new Coord(2, 2)],
        [new Coord(0, 2), new Coord(1, 1), new Coord(2, 0)],
    ];
    public static isVictory(state: EncapsuleState): MGPOptional<Player> {
        const board: EncapsuleCase[][] = state.getCopiedBoard();
        let victory: MGPOptional<Player> = MGPOptional.empty();
        let i: number = 0;
        let line: Coord[];
        while (victory.isAbsent() && i<8) {
            line = EncapsuleRules.LINES[i++];
            const cases: EncapsuleCase[] = [board[line[0].y][line[0].x],
                board[line[1].y][line[1].x],
                board[line[2].y][line[2].x]];
            victory = EncapsuleRules.isVictoriousLine(cases);
        }
        return victory;
    }
    public static isVictoriousLine(cases: EncapsuleCase[]): MGPOptional<Player> {
        const pieces: EncapsulePiece[] = cases.map((c: EncapsuleCase) => c.getBiggest());
        const owner: Player[] = pieces.map((piece: EncapsulePiece) => piece.getPlayer());
        if (owner[0] === Player.NONE) {
            return MGPOptional.empty();
        } else {
            if ((owner[0] === owner[1]) && (owner[1] === owner[2])) {
                return MGPOptional.of(owner[0]);
            } else {
                return MGPOptional.empty();
            }
        }
    }
    public static isLegal(move: EncapsuleMove, state: EncapsuleState): MGPFallible<EncapsuleLegalityInformation> {
        const LOCAL_VERBOSE: boolean = false;
        display(LOCAL_VERBOSE, move.toString());
        let movingPiece: EncapsulePiece;
        if (move.isDropping()) {
            movingPiece = move.piece.get();
            if (state.pieceBelongsToCurrentPlayer(movingPiece) === false) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
            }
            if (state.isInRemainingPieces(movingPiece) === false) {
                return MGPFallible.failure(EncapsuleFailure.PIECE_OUT_OF_STOCK());
            }
        } else {
            const startingCoord: Coord = move.startingCoord.get();
            const startingCase: EncapsuleCase = state.getPieceAt(startingCoord);
            movingPiece = startingCase.getBiggest();
            if (state.pieceBelongsToCurrentPlayer(movingPiece) === false) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
            }
        }
        const landingCase: EncapsuleCase = state.getPieceAt(move.landingCoord);
        const superpositionResult: MGPOptional<EncapsuleCase> = landingCase.tryToSuperposePiece(movingPiece);
        if (superpositionResult.isPresent()) {
            return MGPFallible.success(superpositionResult.get());
        }
        return MGPFallible.failure(EncapsuleFailure.INVALID_PLACEMENT());
    }
    public isLegal(move: EncapsuleMove, state: EncapsuleState): MGPFallible<EncapsuleLegalityInformation> {
        return EncapsuleRules.isLegal(move, state);
    }
    public applyLegalMove(move: EncapsuleMove,
                          state: EncapsuleState,
                          newLandingCase: EncapsuleLegalityInformation)
    : EncapsuleState
    {
        const newBoard: EncapsuleCase[][] = state.getCopiedBoard();

        let newRemainingPiece: EncapsulePiece[] = state.getRemainingPieces();
        const newTurn: number = state.turn + 1;
        newBoard[move.landingCoord.y][move.landingCoord.x] = EncapsuleCase.decode(newLandingCase.encode());
        let movingPiece: EncapsulePiece;
        if (move.isDropping()) {
            movingPiece = move.piece.get();
            const indexBiggest: number = newRemainingPiece.indexOf(movingPiece);
            newRemainingPiece = newRemainingPiece.slice(0, indexBiggest)
                .concat(newRemainingPiece.slice(indexBiggest + 1));
        } else {
            const startingCoord: Coord = move.startingCoord.get();
            const oldStartingNumber: number = newBoard[startingCoord.y][startingCoord.x].encode();
            const oldStartingCase: EncapsuleCase = EncapsuleCase.decode(oldStartingNumber);
            const removalResult: {removedCase: EncapsuleCase, removedPiece: EncapsulePiece} =
                oldStartingCase.removeBiggest();
            newBoard[startingCoord.y][startingCoord.x] = EncapsuleCase.decode(removalResult.removedCase.encode());
            movingPiece = removalResult.removedPiece;
        }
        const resultingState: EncapsuleState = new EncapsuleState(newBoard, newTurn, newRemainingPiece);
        return resultingState;
    }
    public static getGameStatus(node: EncapsuleNode): GameStatus {
        const state: EncapsuleState = node.gameState;
        const winner: MGPOptional<Player> = EncapsuleRules.isVictory(state);
        if (winner.isPresent()) {
            return GameStatus.getVictory(winner.get());
        } else {
            return GameStatus.ONGOING;
        }
    }
    public getGameStatus(node: EncapsuleNode): GameStatus {
        return EncapsuleRules.getGameStatus(node);
    }
}
