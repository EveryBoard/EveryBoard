import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { LodestoneFailure } from './LodestoneFailure';
import { LodestoneCaptures, LodestoneMove } from './LodestoneMove';
import { LodestoneOrientation, LodestoneDirection, LodestonePiece, LodestonePieceLodestone, LodestonePieceNone, LodestoneDescription } from './LodestonePiece';
import { LodestoneState, LodestonePositions, LodestonePressurePlates, LodestonePressurePlate, LodestonePressurePlatePosition } from './LodestoneState';
import { RulesConfig } from 'src/app/jscaip/ConfigUtil';

export class LodestoneNode extends MGPNode<LodestoneRules, LodestoneMove, LodestoneState, RulesConfig, LodestoneInfos> {}

export type LodestoneInfos = {
    board: LodestonePiece[][]
    captures: Coord[]
    moved: Coord[]
}

export interface PressurePlateViewPosition {
    startForBigPlate: Coord,
    startForSmallPlate: Coord,
    direction: Direction,
}

export type PressurePlatePositionInformation =
    MGPMap<LodestonePressurePlatePosition, PressurePlateViewPosition>;

export class LodestoneRules extends Rules<LodestoneMove, LodestoneState, RulesConfig, LodestoneInfos> {
    public static readonly THREATENED_COORD_RANGE: PressurePlatePositionInformation = MGPMap.from({
        top: {
            startForBigPlate: new Coord(0, 0),
            startForSmallPlate: new Coord(0, 1),
            direction: Direction.RIGHT,
        },
        bottom: {
            startForBigPlate: new Coord(0, LodestoneState.SIZE-1),
            startForSmallPlate: new Coord(0, LodestoneState.SIZE-2),
            direction: Direction.RIGHT,
        },
        left: {
            startForBigPlate: new Coord(0, 0),
            startForSmallPlate: new Coord(1, 0),
            direction: Direction.DOWN,
        },
        right: {
            startForBigPlate: new Coord(LodestoneState.SIZE-1, 0),
            startForSmallPlate: new Coord(LodestoneState.SIZE-2, 0),
            direction: Direction.DOWN,
        },
    });

    private static singleton: MGPOptional<LodestoneRules> = MGPOptional.empty();

    public static get(): LodestoneRules {
        if (LodestoneRules.singleton.isAbsent()) {
            LodestoneRules.singleton = MGPOptional.of(new LodestoneRules());
        }
        return LodestoneRules.singleton.get();
    }
    private constructor() {
        super(LodestoneState, {});
    }
    public applyLegalMove(move: LodestoneMove, state: LodestoneState, infos: LodestoneInfos): LodestoneState {
        const currentPlayer: Player = state.getCurrentPlayer();
        const opponent: Player = currentPlayer.getOpponent();
        const board: LodestonePiece[][] = ArrayUtils.copyBiArray(infos.board);
        const lodestones: LodestonePositions = state.lodestones.getCopy();
        lodestones.put(currentPlayer, move.coord);
        const pressurePlates: LodestonePressurePlates = { ...state.pressurePlates };
        this.updatePressurePlates(board, pressurePlates, lodestones, opponent, move.captures);
        return new LodestoneState(board, state.turn + 1, lodestones, pressurePlates);
    }
    public updatePressurePlates(board: LodestonePiece[][],
                                pressurePlates: LodestonePressurePlates,
                                lodestones: LodestonePositions,
                                opponent: Player,
                                captures: LodestoneCaptures)
    : void
    {
        for (const position of LodestonePressurePlate.POSITIONS) {
            pressurePlates[position] = this.updatePressurePlate(board,
                                                                position,
                                                                pressurePlates[position],
                                                                lodestones,
                                                                opponent,
                                                                captures[position]);
        }
    }
    private updatePressurePlate(board: LodestonePiece[][],
                                position: LodestonePressurePlatePosition,
                                pressurePlate: MGPOptional<LodestonePressurePlate>,
                                lodestones: LodestonePositions,
                                opponent: Player,
                                captured: number)
    : MGPOptional<LodestonePressurePlate>
    {
        if (pressurePlate.isPresent()) {
            const newPressurePlate: MGPOptional<LodestonePressurePlate> =
                pressurePlate.get().addCaptured(opponent, captured);
            const plateInfo: PressurePlateViewPosition = LodestoneRules.THREATENED_COORD_RANGE.get(position).get();
            if (newPressurePlate.isAbsent()) {
                // The second pressure plate has fallen, crumble both rows
                this.removePressurePlate(board, plateInfo.startForBigPlate, plateInfo.direction, lodestones);
                this.removePressurePlate(board, plateInfo.startForSmallPlate, plateInfo.direction, lodestones);
            } else if (newPressurePlate.get().width < pressurePlate.get().width) {
                // The first pressure plate has fallen
                this.removePressurePlate(board, plateInfo.startForBigPlate, plateInfo.direction, lodestones);
            }
            return newPressurePlate;
        } else {
            return pressurePlate;
        }
    }
    private removePressurePlate(board: LodestonePiece[][],
                                start: Coord,
                                direction: Direction,
                                lodestones: LodestonePositions)
    : void
    {
        for (let coord: Coord = start; // eslint-disable-next-line indent
             coord.isInRange(LodestoneState.SIZE, LodestoneState.SIZE); // eslint-disable-next-line indent
             coord = coord.getNext(direction))
        {
            for (const player of Player.PLAYERS) {
                if (lodestones.get(player).equalsValue(coord)) {
                    lodestones.delete(player);
                }
            }
            board[coord.y][coord.x] = LodestonePieceNone.UNREACHABLE;
        }
    }
    public isLegal(move: LodestoneMove, state: LodestoneState): MGPFallible<LodestoneInfos> {
        const validityBeforeCaptures: MGPValidation = this.isLegalWithoutCaptures(state, move.coord, move.direction);
        if (validityBeforeCaptures.isFailure()) {
            return MGPFallible.failure(validityBeforeCaptures.getReason());
        }
        const infos: LodestoneInfos =
            this.applyMoveWithoutPlacingCaptures(state, move.coord, move);
        const numberOfCapturesInMove: number =
            move.captures.top + move.captures.bottom + move.captures.left + move.captures.right;
        const actualCaptures: number = Math.min(infos.captures.length, state.remainingSpaces());
        if (numberOfCapturesInMove !== actualCaptures) {
            return MGPFallible.failure(LodestoneFailure.MUST_PLACE_CAPTURES_ON_PRESSURE_PLATES());
        }
        for (const position of LodestonePressurePlate.POSITIONS) {
            const pressurePlate: MGPOptional<LodestonePressurePlate> = state.pressurePlates[position];
            if (pressurePlate.isPresent() && pressurePlate.get().remainingSpaces() < move.captures[position]) {
                return MGPFallible.failure(LodestoneFailure.TOO_MANY_CAPTURES_ON_SAME_PRESSURE_PLATE());
            }
        }
        return MGPFallible.success(infos);
    }
    public applyMoveWithoutPlacingCaptures(state: LodestoneState,
                                           coord: Coord,
                                           lodestone: LodestoneDescription)
    : LodestoneInfos
    {
        let result: LodestoneInfos;
        const board: LodestonePiece[][] = ArrayUtils.copyBiArray(state.board);
        const previousLodestonePosition: MGPOptional<Coord> = state.lodestones.get(state.getCurrentPlayer());
        if (previousLodestonePosition.isPresent()) {
            const previousCoord: Coord = previousLodestonePosition.get();
            board[previousCoord.y][previousCoord.x] = LodestonePieceNone.EMPTY;
        }
        if (lodestone.direction === 'pull') {
            result = this.applyPull(state, board, coord, lodestone.orientation);
        } else {
            result = this.applyPush(state, board, coord, lodestone.orientation);
        }
        result.board[coord.y][coord.x] =
            LodestonePieceLodestone.of(state.getCurrentPlayer(), lodestone);
        result.moved.push(coord);
        return result;
    }
    private applyPull(state: LodestoneState,
                      board: LodestonePiece[][],
                      lodestone: Coord,
                      orientation: LodestoneOrientation)
    : LodestoneInfos
    {
        const currentPlayer: Player = state.getCurrentPlayer();
        const opponent: Player = currentPlayer.getOpponent();
        const captures: Coord[] = [];
        const moved: Coord[] = [];
        const directions: readonly Direction[] = orientation === 'diagonal' ? Direction.DIAGONALS : Direction.ORTHOGONALS;
        for (const direction of directions) {
            for (let coord: Coord = lodestone.getNext(direction); // eslint-disable-next-line indent
                 state.isOnBoard(coord); // eslint-disable-next-line indent
                 coord = coord.getNext(direction)) {
                const pieceOnTarget: LodestonePiece = board[coord.y][coord.x];
                const next: Coord = coord.getNext(direction);
                if (state.isOnBoard(next)) {
                    const pieceToMove: LodestonePiece = board[next.y][next.x];
                    if (pieceToMove.isPlayerPiece() && pieceToMove.owner === currentPlayer) {
                        // We move player piece of the next coord to the current coord
                        // hence in the opposite of direction
                        if (pieceOnTarget.isEmpty()) {
                            // Moving to an empty square
                            moved.push(coord);
                            board[coord.y][coord.x] = pieceToMove;
                            moved.push(next);
                            board[next.y][next.x] = LodestonePieceNone.EMPTY;
                        } else if (pieceOnTarget.isPlayerPiece() && pieceOnTarget.owner === opponent) {
                            // Capturing a player piece
                            captures.push(coord);
                            board[coord.y][coord.x] = pieceToMove;
                            moved.push(next);
                            board[next.y][next.x] = LodestonePieceNone.EMPTY;
                        }
                    }
                }
            }
        }
        return { board, captures, moved };
    }
    private applyPush(state: LodestoneState,
                      board: LodestonePiece[][],
                      lodestone: Coord,
                      orientation: LodestoneOrientation)
    : LodestoneInfos
    {
        const currentPlayer: Player = state.getCurrentPlayer();
        const opponent: Player = currentPlayer.getOpponent();
        const captures: Coord[] = [];
        const moved: Coord[] = [];
        const directions: readonly Direction[] = orientation === 'diagonal' ? Direction.DIAGONALS : Direction.ORTHOGONALS;
        for (const direction of directions) {
            const start: Coord = lodestone.getNext(direction, LodestoneState.SIZE);
            for (let coord: Coord = start; // eslint-disable-next-line indent
                 coord.equals(lodestone) === false; // eslint-disable-next-line indent
                 coord = coord.getPrevious(direction)) {
                if (state.isOnBoard(coord)) {
                    const pieceToMove: LodestonePiece = board[coord.y][coord.x];
                    if (pieceToMove.isPlayerPiece() && pieceToMove.owner === opponent) {
                        const next: Coord = coord.getNext(direction);
                        if (state.isOnBoard(next)) {
                            const pieceOnTarget: LodestonePiece = board[next.y][next.x];
                            if (pieceOnTarget.isUnreachable()) {
                                // Floor here has crumbled, the piece falls
                                captures.push(coord);
                                board[coord.y][coord.x] = LodestonePieceNone.EMPTY;
                            } else if (pieceOnTarget.isEmpty()) {
                                // Moving to an empty square
                                moved.push(next);
                                board[next.y][next.x] = pieceToMove;
                                moved.push(coord);
                                board[coord.y][coord.x] = LodestonePieceNone.EMPTY;
                            }
                        } else {
                            // Piece falls off the board
                            captures.push(coord);
                            board[coord.y][coord.x] = LodestonePieceNone.EMPTY;
                        }
                    }
                }
            }
        }
        return { board, captures, moved };
    }
    public isLegalWithoutCaptures(state: LodestoneState, coord: Coord, direction: LodestoneDirection): MGPValidation {
        const targetValidity: MGPValidation = this.isTargetLegal(state, coord);
        if (targetValidity.isFailure()) {
            return targetValidity;
        }
        const nextLodestoneDirection: MGPOptional<LodestoneDirection> = state.nextLodestoneDirection();
        const validLodestoneDirection: boolean =
            nextLodestoneDirection.isAbsent() || nextLodestoneDirection.equalsValue(direction);
        if (validLodestoneDirection === false) {
            return MGPValidation.failure(LodestoneFailure.MUST_FLIP_LODESTONE());
        }
        return MGPValidation.SUCCESS;
    }
    public isTargetLegal(state: LodestoneState, coord: Coord): MGPValidation {
        const targetContent: LodestonePiece = state.getPieceAt(coord);
        if (targetContent.isUnreachable()) {
            return MGPValidation.failure(LodestoneFailure.TARGET_IS_CRUMBLED());
        }
        if (targetContent.isPlayerPiece()) {
            return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        }
        const player: Player = state.getCurrentPlayer();
        if (targetContent.isLodestone() && targetContent.owner !== player) {
            return MGPValidation.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        }
        return MGPValidation.SUCCESS;
    }
    public getGameStatus(node: LodestoneNode): GameStatus {
        const state: LodestoneState = node.gameState;
        const pieces: [number, number] = state.numberOfPieces();
        if (pieces[0] === 0 && pieces[1] === 0) {
            return GameStatus.DRAW;
        } else if (pieces[0] === 0) {
            return GameStatus.ONE_WON;
        } else if (pieces[1] === 0) {
            return GameStatus.ZERO_WON;
        } else {
            return GameStatus.ONGOING;
        }
    }
}
