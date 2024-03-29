import { Rules } from '../../jscaip/Rules';
import { GameNode } from 'src/app/jscaip/AI/GameNode';
import { EncapsuleState, EncapsuleSpace } from './EncapsuleState';
import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { EncapsuleMove } from './EncapsuleMove';
import { EncapsulePiece } from './EncapsulePiece';
import { EncapsuleFailure } from './EncapsuleFailure';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { Debug } from 'src/app/utils/utils';
import { TableUtils } from 'src/app/utils/ArrayUtils';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export type EncapsuleLegalityInformation = EncapsuleSpace;

export class EncapsuleNode extends GameNode<EncapsuleMove, EncapsuleState> {}

@Debug.log
// eslint-disable-next-line max-len
export class EncapsuleRules extends Rules<EncapsuleMove, EncapsuleState, EncapsuleLegalityInformation> {

    private static singleton: MGPOptional<EncapsuleRules> = MGPOptional.empty();

    public static get(): EncapsuleRules {
        if (EncapsuleRules.singleton.isAbsent()) {
            EncapsuleRules.singleton = MGPOptional.of(new EncapsuleRules());
        }
        return EncapsuleRules.singleton.get();
    }

    public override getInitialState(): EncapsuleState {
        const _: EncapsuleSpace = new EncapsuleSpace(PlayerOrNone.NONE, PlayerOrNone.NONE, PlayerOrNone.NONE);
        const startingBoard: EncapsuleSpace[][] = TableUtils.create(3, 3, _);
        const initialPieces: EncapsulePiece[] = [
            EncapsulePiece.BIG_DARK, EncapsulePiece.BIG_DARK, EncapsulePiece.BIG_LIGHT,
            EncapsulePiece.BIG_LIGHT, EncapsulePiece.MEDIUM_DARK, EncapsulePiece.MEDIUM_DARK,
            EncapsulePiece.MEDIUM_LIGHT, EncapsulePiece.MEDIUM_LIGHT, EncapsulePiece.SMALL_DARK,
            EncapsulePiece.SMALL_DARK, EncapsulePiece.SMALL_LIGHT, EncapsulePiece.SMALL_LIGHT,
        ];
        return new EncapsuleState(startingBoard, 0, initialPieces);
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
        let movingPiece: EncapsulePiece;
        if (move.isDropping()) {
            movingPiece = move.piece.get();
            const owner: PlayerOrNone = movingPiece.getPlayer();
            if (owner === PlayerOrNone.NONE) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
            }
            if (owner === state.getCurrentOpponent()) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
            }
            if (state.isInRemainingPieces(movingPiece) === false) {
                return MGPFallible.failure(EncapsuleFailure.PIECE_OUT_OF_STOCK());
            }
        } else {
            const startingCoord: Coord = move.startingCoord.get();
            const startingSpace: EncapsuleSpace = state.getPieceAt(startingCoord);
            movingPiece = startingSpace.getBiggest();
            const owner: PlayerOrNone = movingPiece.getPlayer();
            if (owner === PlayerOrNone.NONE) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
            }
            if (owner === state.getCurrentOpponent()) {
                return MGPFallible.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
            }
        }
        const landingSpace: EncapsuleSpace = state.getPieceAt(move.landingCoord);
        const superpositionResult: MGPOptional<EncapsuleSpace> = landingSpace.tryToSuperposePiece(movingPiece);
        if (superpositionResult.isPresent()) {
            return MGPFallible.success(superpositionResult.get());
        }
        return MGPFallible.failure(EncapsuleFailure.INVALID_PLACEMENT());
    }

    public override isLegal(move: EncapsuleMove, state: EncapsuleState): MGPFallible<EncapsuleLegalityInformation> {
        return EncapsuleRules.isLegal(move, state);
    }

    public override applyLegalMove(move: EncapsuleMove,
                                   state: EncapsuleState,
                                   _config: NoConfig,
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
