import { Rules } from '../../jscaip/Rules';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { EncapsuleState, EncapsuleSpace } from './EncapsuleState';
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { display } from 'src/app/utils/utils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsulePiece } from './EncapsulePiece';
import { EncapsuleFailure } from './EncapsuleFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { GameStatus } from 'src/app/jscaip/GameStatus';

export type EncapsuleLegalityInformation = EncapsuleSpace;

export class EncapsuleNode
    extends MGPNode<EncapsuleRules, EncapsuleMove, EncapsuleState, EncapsuleLegalityInformation> {}

export class EncapsuleRules extends Rules<EncapsuleMove, EncapsuleState, EncapsuleLegalityInformation> {

    private static singleton: MGPOptional<EncapsuleRules> = MGPOptional.empty();

    public static get(): EncapsuleRules {
        if (EncapsuleRules.singleton.isAbsent()) {
            EncapsuleRules.singleton = MGPOptional.of(new EncapsuleRules());
        }
        return EncapsuleRules.singleton.get();
    }
    private constructor() {
        super(EncapsuleState);
    }
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
        const board: EncapsuleSpace[][] = state.getCopiedBoard();
        for (const line of EncapsuleRules.LINES) {
            const spaces: EncapsuleSpace[] = [board[line[0].y][line[0].x],
                board[line[1].y][line[1].x],
                board[line[2].y][line[2].x]];
            const victory: MGPOptional<Player> = EncapsuleRules.isVictoriousLine(spaces);
            if (victory.isPresent()) {
                return victory;
            }
        }
        return MGPOptional.empty();
    }
    public static isVictoriousLine(spaces: EncapsuleSpace[]): MGPOptional<Player> {
        const pieces: EncapsulePiece[] = spaces.map((c: EncapsuleSpace) => c.getBiggest());
        const owner: PlayerOrNone[] = pieces.map((piece: EncapsulePiece) => piece.getPlayer());
        if (owner[0] === PlayerOrNone.NONE) {
            return MGPOptional.empty();
        } else {
            if ((owner[0] === owner[1]) && (owner[1] === owner[2])) {
                return MGPOptional.of(owner[0] as Player);
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
            const startingSpace: EncapsuleSpace = state.getPieceAt(startingCoord);
            movingPiece = startingSpace.getBiggest();
            if (state.pieceBelongsToCurrentPlayer(movingPiece) === false) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
            }
        }
        const landingSpace: EncapsuleSpace = state.getPieceAt(move.landingCoord);
        const superpositionResult: MGPOptional<EncapsuleSpace> = landingSpace.tryToSuperposePiece(movingPiece);
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
                          newLandingSpace: EncapsuleLegalityInformation)
    : EncapsuleState
    {
        const newBoard: EncapsuleSpace[][] = state.getCopiedBoard();

        let newRemainingPiece: EncapsulePiece[] = state.getRemainingPieces();
        const newTurn: number = state.turn + 1;
        newBoard[move.landingCoord.y][move.landingCoord.x] = newLandingSpace;
        let movingPiece: EncapsulePiece;
        if (move.isDropping()) {
            movingPiece = move.piece.get();
            const indexBiggest: number = newRemainingPiece.indexOf(movingPiece);
            newRemainingPiece = newRemainingPiece.slice(0, indexBiggest)
                .concat(newRemainingPiece.slice(indexBiggest + 1));
        } else {
            const startingCoord: Coord = move.startingCoord.get();
            const oldStartingSpace: EncapsuleSpace = newBoard[startingCoord.y][startingCoord.x];
            const removalResult: {removedSpace: EncapsuleSpace, removedPiece: EncapsulePiece} =
                oldStartingSpace.removeBiggest();
            newBoard[startingCoord.y][startingCoord.x] = removalResult.removedSpace;
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
