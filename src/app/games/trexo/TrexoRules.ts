import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { SCORE } from 'src/app/jscaip/SCORE';
import { Localized } from 'src/app/utils/LocaleUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TrexoMove } from './TrexoMove';
import { TrexoSpace, TrexoState } from './TrexoState';

export class TrexoRulesFailure {
    public static readonly CANNOT_DROP_ON_ONLY_ONE_PIECE: Localized = () => $localize`TODOTODO: CANNOT_DROP_ON_ONLY_ONE_PIECE`;
    public static readonly CANNOT_DROP_PIECE_ON_UNEVEN_GROUNDS: Localized = () => $localize`TODOTODO: CANNOT_DROP_PIECE_ON_UNEVEN_GROUNDS`;
}

export class TrexoNode extends MGPNode<Rules<TrexoMove, TrexoState>, TrexoMove, TrexoState> {}

export class TrexoRules extends Rules<TrexoMove, TrexoState> {

    private static instance: MGPOptional<TrexoRules> = MGPOptional.empty();

    public static get(): TrexoRules {
        if (TrexoRules.instance.isAbsent()) {
            TrexoRules.instance = MGPOptional.of(new TrexoRules());
        }
        return TrexoRules.instance.get();
    }
    private constructor() {
        super(TrexoState);
    }
    public applyLegalMove(move: TrexoMove, state: TrexoState): TrexoState {
        return state
            .drop(move.zero, Player.ZERO)
            .drop(move.one, Player.ONE)
            .incrementTurn();
    }
    public isLegal(move: TrexoMove, state: TrexoState): MGPFallible<void> {
        if (this.isUnevenGround(move, state)) {
            return MGPFallible.failure(TrexoRulesFailure.CANNOT_DROP_PIECE_ON_UNEVEN_GROUNDS());
        }
        if (this.landsOnOnlyOnePiece(move, state)) {
            return MGPFallible.failure(TrexoRulesFailure.CANNOT_DROP_ON_ONLY_ONE_PIECE());
        }
        return MGPFallible.success(undefined);
    }
    public isUnevenGround(move: TrexoMove, state: TrexoState): boolean {
        const zero: TrexoSpace = state.getPieceAt(move.zero);
        const one: TrexoSpace = state.getPieceAt(move.one);
        return zero.height !== one.height;
    }
    public landsOnOnlyOnePiece(move: TrexoMove, state: TrexoState): boolean {
        const zeroSpace: TrexoSpace = state.getPieceAt(move.zero);
        const oneSpace: TrexoSpace = state.getPieceAt(move.one);
        if (zeroSpace.landingTurn === -1 && oneSpace.landingTurn === -1) {
            return false;
        }
        return zeroSpace.landingTurn === oneSpace.landingTurn;
    }
    public static getSquareScore(state: TrexoState, coord: Coord): number {
        // TODOTODO: assert correct casting
        const getOwner: (piece: TrexoSpace) => PlayerOrNone = (piece: TrexoSpace) => {
            return piece.owner;
        };
        const isInRange: (coord: Coord) => boolean = (coord: Coord) => {
            return coord.isInRange(TrexoState.SIZE, TrexoState.SIZE);
        };
        return NInARowHelper.getSquareScore(state, coord, getOwner, 5, isInRange);
    }
    public static getVictoriousCoords(state: TrexoState): Coord[] {
        const victoryOfLastPlayer: Coord[] = [];
        const victoryOfNextPlayer: Coord[] = [];
        const lastPlayer: Player = state.getCurrentOpponent();
        for (let x: number = 0; x < TrexoState.SIZE; x++) {
            // for every column, starting from the bottom of each column
            for (let y: number = 0; y < TrexoState.SIZE; y++) {
                // while we haven't reached the top or an empty space
                const coord: Coord = new Coord(x, y);
                const pieceOwner: PlayerOrNone = state.getPieceAt(coord).owner;
                if (pieceOwner.isPlayer()) {
                    const tmpScore: number = TrexoRules.getSquareScore(state, coord);
                    if (MGPNode.getScoreStatus(tmpScore) === SCORE.VICTORY) {
                        if (pieceOwner === lastPlayer) {
                            victoryOfLastPlayer.push(coord);
                        } else {
                            victoryOfNextPlayer.push(coord);
                        }
                    }
                }
            }
        }
        if (victoryOfNextPlayer.length > 0) {
            return victoryOfNextPlayer;
        } else {
            return victoryOfLastPlayer;
        }
    }
    public getGameStatus(node: TrexoNode): GameStatus {
        const state: TrexoState = node.gameState;
        const lastPlayer: Player = state.getCurrentOpponent();
        let lastPlayerAligned5: boolean = false;
        for (let x: number = 0; x < TrexoState.SIZE; x++) {
            // for every column, starting from the bottom of each column
            for (let y: number = 0; y < TrexoState.SIZE; y++) {
                // while we haven't reached the top or an empty space
                const pieceOwner: PlayerOrNone = state.getPieceAtXY(x, y).owner;
                if (pieceOwner.isPlayer()) {
                    const tmpScore: number = TrexoRules.getSquareScore(state, new Coord(x, y));
                    if (MGPNode.getScoreStatus(tmpScore) === SCORE.VICTORY) {
                        if (pieceOwner === lastPlayer) {
                            lastPlayerAligned5 = true;
                        } else {
                            return GameStatus.getDefeat(lastPlayer);
                        }
                    }
                }
            }
        }
        if (lastPlayerAligned5) {
            return GameStatus.getVictory(lastPlayer);
        }
        return GameStatus.ONGOING;
    }
    public getLegalMoves(state: TrexoState): TrexoMove[] {
        const moves: TrexoMove[] = [];
        for (let x: number = 0; x < TrexoState.SIZE; x++) {
            for (let y: number = 0; y < TrexoState.SIZE; y++) {
                const upOrleftCord: Coord = new Coord(x, y);
                if (x + 1 < TrexoState.SIZE) {
                    const rightCoord: Coord = new Coord(x + 1, y);
                    moves.push(...this.getPossiblesMoves(state, upOrleftCord, rightCoord));
                }
                if (y + 1 < TrexoState.SIZE) {
                    const downCoord: Coord = new Coord(x, y + 1);
                    moves.push(...this.getPossiblesMoves(state, upOrleftCord, downCoord));
                }
            }
        }
        return moves;
    }
    public getPossiblesMoves(state: TrexoState, first: Coord, second: Coord): TrexoMove[] {
        const firstPiece: TrexoSpace = state.getPieceAt(first);
        const secondPiece: TrexoSpace = state.getPieceAt(second);
        let piecesHideEntirelyOnePiece: boolean;
        if (firstPiece.landingTurn === -1) {
            piecesHideEntirelyOnePiece = false; // worst case scenario they both cover "turn -1"
        } else {
            piecesHideEntirelyOnePiece = (firstPiece.landingTurn === secondPiece.landingTurn);
        }
        const pieceIsAllDeTravers: boolean = firstPiece.height !== secondPiece.height;
        if (piecesHideEntirelyOnePiece || pieceIsAllDeTravers) {
            return [];
        } else {
            return [
                TrexoMove.from(first, second).get(),
                TrexoMove.from(second, first).get(),
            ];
        }
    }
}
