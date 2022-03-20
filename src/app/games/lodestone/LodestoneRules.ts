import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { LodestoneFailure } from './LodestoneFailure';
import { LodestoneCaptures, LodestoneMove } from './LodestoneMove';
import { LodestoneDirection, LodestonePiece, LodestonePieceLodestone, LodestonePieceNone } from './LodestonePiece';
import { LodestoneState, LodestoneLodestones, LodestonePressurePlates, LodestonePressurePlate, LodestonePressurePlatePosition } from './LodestoneState';

export class LodestoneNode extends MGPNode<LodestoneRules, LodestoneMove, LodestoneState, LodestoneInfos> { }

export type LodestoneInfos = {
    board: LodestonePiece[][]
    captures: Coord[]
}

export class LodestoneRules extends Rules<LodestoneMove, LodestoneState, LodestoneInfos> {
    private static readonly PRESSURE_PLATES_POSITIONS
    : Record<LodestonePressurePlatePosition, [Coord, Coord, Direction]> = {
        top: [new Coord(0, 0), new Coord(0, 1), Direction.RIGHT],
        bottom: [new Coord(0, LodestoneState.SIZE), new Coord(0, LodestoneState.SIZE-1), Direction.RIGHT],
        left: [new Coord(0, 0), new Coord(1, 0), Direction.DOWN],
        right: [new Coord(LodestoneState.SIZE, 0), new Coord(LodestoneState.SIZE-1, 0), Direction.DOWN],
    };

    private static singleton: MGPOptional<LodestoneRules> = MGPOptional.empty();
    public static get(): LodestoneRules {
        if (LodestoneRules.singleton.isAbsent()) {
            LodestoneRules.singleton = MGPOptional.of(new LodestoneRules());
        }
        return LodestoneRules.singleton.get();
    }

    private constructor() {
        super(LodestoneState);
    }
    public applyLegalMove(move: LodestoneMove, state: LodestoneState, infos: LodestoneInfos): LodestoneState {
        const currentPlayer: Player = state.getCurrentPlayer();
        const opponent: Player = currentPlayer.getOpponent();
        const board: LodestonePiece[][] = ArrayUtils.copyBiArray(infos.board);
        const lodestones: LodestoneLodestones = [state.lodestones[0], state.lodestones[1]];
        lodestones[currentPlayer.value] = MGPOptional.of(move.coord);
        board[move.coord.y][move.coord.x] = new LodestonePieceLodestone(currentPlayer, move.direction);
        const pressurePlates: LodestonePressurePlates = { ...state.pressurePlates };
        this.updatePressurePlates(board, pressurePlates, opponent, move.captures);
        return new LodestoneState(board, state.turn + 1, lodestones, pressurePlates);

    }
    private updatePressurePlates(board: LodestonePiece[][],
                                 pressurePlates: LodestonePressurePlates,
                                 opponent: Player,
                                 captures: LodestoneCaptures)
    : void
    {
        for (const position of LodestonePressurePlate.POSITIONS) {
            pressurePlates[position] =
                this.updatePressurePlate(board, position, pressurePlates[position], opponent, captures[position]);
        }
    }
    private updatePressurePlate(board: LodestonePiece[][],
                                position: LodestonePressurePlatePosition,
                                pressurePlate: MGPOptional<LodestonePressurePlate>,
                                opponent: Player,
                                captured: number)
    : MGPOptional<LodestonePressurePlate>
    {
        if (pressurePlate.isPresent()) {
            const newPressurePlate: MGPOptional<LodestonePressurePlate> =
                pressurePlate.get().addCaptured(opponent, captured);
            const plateInfo: [Coord, Coord, Direction] = LodestoneRules.PRESSURE_PLATES_POSITIONS[position];
            if (newPressurePlate.isAbsent()) {
                // The second pressure plate has fallen, crumble both rows
                this.removePressurePlate(board, plateInfo[0], plateInfo[2]);
                this.removePressurePlate(board, plateInfo[1], plateInfo[2]);
            } else if (newPressurePlate.get().width < pressurePlate.get().width) {
                // The first pressure plate has fallen
                this.removePressurePlate(board, plateInfo[0], plateInfo[2]);
            }
            return newPressurePlate;
        } else {
            return pressurePlate;
        }
    }
    private removePressurePlate(board: LodestonePiece[][], start: Coord, direction: Direction): void {
        for (let coord: Coord = start; // eslint-disable-next-line indent
             coord.isInRange(LodestoneState.SIZE, LodestoneState.SIZE); // eslint-disable-next-line indent
             coord = coord.getNext(direction)) {
            board[coord.y][coord.x] = LodestonePieceNone.UNREACHABLE;
        }
    }
    private applyPull(lodestone: Coord, diagonal: boolean, state: LodestoneState): [LodestonePiece[][], Coord[]] {
        const currentPlayer: Player = state.getCurrentPlayer();
        const opponent: Player = currentPlayer.getOpponent();
        const board: LodestonePiece[][] = ArrayUtils.copyBiArray(state.board);
        const captures: Coord[] = [];
        const directions: readonly Direction[] = diagonal ? Direction.DIAGONALS : Direction.ORTHOGONALS;
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
                            board[coord.y][coord.x] = pieceToMove;
                            board[next.y][next.x] = LodestonePieceNone.EMPTY;
                        } else if (pieceOnTarget.isPlayerPiece() && pieceOnTarget.owner === opponent) {
                            // Capturing a player piece
                            captures.push(coord);
                            board[coord.y][coord.x] = pieceToMove;
                            board[next.y][next.x] = LodestonePieceNone.EMPTY;
                        }
                    }
                }
            }
        }
        return [board, captures];
    }
    private applyPush(lodestone: Coord, diagonal: boolean, state: LodestoneState): [LodestonePiece[][], Coord[]] {
        const currentPlayer: Player = state.getCurrentPlayer();
        const opponent: Player = currentPlayer.getOpponent();
        const board: LodestonePiece[][] = ArrayUtils.copyBiArray(state.board);
        const captures: Coord[] = [];
        const directions: readonly Direction[] = diagonal ? Direction.DIAGONALS : Direction.ORTHOGONALS;
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
                                board[next.y][next.x] = pieceToMove;
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
        return [board, captures];
    }
    public isLegal(move: LodestoneMove, state: LodestoneState): MGPFallible<LodestoneInfos> {
        const targetContent: LodestonePiece = state.getPieceAt(move.coord);
        if (targetContent.isUnreachable()) {
            return MGPFallible.failure(LodestoneFailure.TARGET_IS_CRUMBLED());
        }
        if (targetContent.isPlayerPiece()) {
            return MGPFallible.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        }
        const player: Player = state.getCurrentPlayer();
        if (targetContent.isLodestone() && targetContent.owner !== player) {
            return MGPFallible.failure(RulesFailure.MUST_CLICK_ON_EMPTY_SQUARE());
        }
        const nextLodestoneDirection: MGPOptional<LodestoneDirection> = state.nextLodestoneDirection();
        const validLodestoneDirection: boolean =
            nextLodestoneDirection.isAbsent() || nextLodestoneDirection.equalsValue(move.direction);
        if (validLodestoneDirection === false) {
            return MGPFallible.failure(LodestoneFailure.MUST_FLIP_LODESTONE());
        }

        let board: LodestonePiece[][];
        let captures: Coord[];
        if (move.direction === 'pull') {
            [board, captures] = this.applyPull(move.coord, move.diagonal, state);
        } else {
            [board, captures] = this.applyPush(move.coord, move.diagonal, state);
        }
        const numberOfCapturesInMove: number =
            move.captures.top + move.captures.bottom + move.captures.left + move.captures.right;
        const actualCaptures: number = Math.min(captures.length, state.remainingSpaces());
        if (numberOfCapturesInMove !== actualCaptures) {
            return MGPFallible.failure(LodestoneFailure.MUST_PLACE_CAPTURES_ON_PRESSURE_PLATES());
        }
        for (const position of LodestonePressurePlate.POSITIONS) {
            const pressurePlate: MGPOptional<LodestonePressurePlate> = state.pressurePlates[position];
            if (pressurePlate.isPresent() && pressurePlate.get().remainingSpaces() < move.captures[position]) {
                return MGPFallible.failure(LodestoneFailure.TOO_MANY_CAPTURES_ON_SAME_PRESSURE_PLATE());
            }
        }

        return MGPFallible.success({ board, captures });
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
