import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Utils } from 'src/app/utils/utils';
import { LinesOfActionFailure } from './LinesOfActionFailure';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionState } from './LinesOfActionState';

export class LinesOfActionNode extends MGPNode<LinesOfActionRules, LinesOfActionMove, LinesOfActionState> {}

export class LinesOfActionRules extends Rules<LinesOfActionMove, LinesOfActionState> {

    public static getListMovesFromState(state: LinesOfActionState): LinesOfActionMove[] {
        const moves: LinesOfActionMove[] = [];

        if (LinesOfActionRules.getVictory(state).isPresent()) {
            return moves;
        }

        for (let y: number = 0; y < LinesOfActionState.SIZE; y++) {
            for (let x: number = 0; x < LinesOfActionState.SIZE; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: Player = state.getPieceAt(coord);
                if (piece !== Player.NONE) {
                    for (const target of LinesOfActionRules.possibleTargets(state, coord)) {
                        const move: LinesOfActionMove = LinesOfActionMove.of(coord, target).get();
                        moves.push(move);
                    }
                }
            }
        }
        return moves;
    }
    public static getNumberOfGroups(state: LinesOfActionState): [number, number] {
        const groups: number[][] = ArrayUtils.createTable(LinesOfActionState.SIZE, LinesOfActionState.SIZE, -1);
        const numGroups: [number, number] = [0, 0];
        let highestGroup: number = 0;
        for (let y: number = 0; y < LinesOfActionState.SIZE; y++) {
            for (let x: number = 0; x < LinesOfActionState.SIZE; x++) {
                if (groups[y][x] === -1) {
                    const content: Player = state.getPieceAt(new Coord(x, y));
                    if (content !== Player.NONE) {
                        highestGroup += 1;
                        LinesOfActionRules.markGroupStartingAt(state, groups, new Coord(x, y), highestGroup);
                        numGroups[content.value] += 1;
                    }
                }
            }
        }
        return numGroups;
    }
    private static markGroupStartingAt(state: LinesOfActionState, groups: number[][], pos: Coord, id: number): void {
        const stack: Coord[] = [pos];
        const player: Player = state.getPieceAt(pos);
        while (stack.length > 0) {
            const coord: Coord = Utils.getNonNullable(stack.pop());
            if (groups[coord.y][coord.x] === -1) {
                const content: Player = state.getPieceAt(coord);
                if (content === player) {
                    groups[coord.y][coord.x] = id;
                    for (const dir of Direction.DIRECTIONS) {
                        const next: Coord = coord.getNext(dir);
                        if (state.isOnBoard(next)) {
                            stack.push(next);
                        }
                    }
                } else if (content === Player.NONE) {
                    groups[coord.y][coord.x] = 0;
                }
            }
        }
    }
    public applyLegalMove(move: LinesOfActionMove,
                          state: LinesOfActionState,
                          _status: void)
    : LinesOfActionState
    {
        const board: Player[][] = state.getCopiedBoard();
        board[move.coord.y][move.coord.x] = Player.NONE;
        board[move.end.y][move.end.x] = state.getCurrentPlayer();

        return new LinesOfActionState(board, state.turn + 1);
    }
    public static isLegal(move: LinesOfActionMove, state: LinesOfActionState): MGPFallible<void> {
        if (state.getPieceAt(move.coord) !== state.getCurrentPlayer()) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        if (move.length() !== this.numberOfPiecesOnLine(state, move.coord, move.direction)) {
            return MGPFallible.failure(LinesOfActionFailure.INVALID_MOVE_LENGTH());
        }
        if (move.coord.getCoordsToward(move.end).some((c: Coord) =>
            state.getPieceAt(c) === state.getCurrentOpponent())) {
            return MGPFallible.failure(LinesOfActionFailure.CANNOT_JUMP_OVER_OPPONENT());
        }
        if (state.getPieceAt(move.end) === state.getCurrentPlayer()) {
            return MGPFallible.failure(RulesFailure.CANNOT_SELF_CAPTURE());
        }
        return MGPFallible.success(undefined);
    }
    public isLegal(move: LinesOfActionMove, state: LinesOfActionState): MGPFallible<void> {
        return LinesOfActionRules.isLegal(move, state);
    }
    private static numberOfPiecesOnLine(state: LinesOfActionState, pos: Coord, dir: Direction): number {
        let count: number = 0;
        for (const coord of LinesOfActionRules.getLineCoords(pos, dir)) {
            if (state.getPieceAt(coord) !== Player.NONE) {
                count += 1;
            }
        }
        return count;
    }
    private static getLineCoords(pos: Coord, dir: Direction): Coord[] {
        const entranceAndDir: [Coord, Direction] = LinesOfActionRules.getEntranceAndForwardDirection(pos, dir);
        let current: Coord = entranceAndDir[0];
        const forwardDirection: Direction = entranceAndDir[1];
        const coords: Coord[] = [];
        while (LinesOfActionState.isOnBoard(current)) {
            coords.push(current);
            current = current.getNext(forwardDirection);
        }
        return coords;
    }
    private static getEntranceAndForwardDirection(pos: Coord, dir: Direction): [Coord, Direction] {
        switch (dir) {
            case Direction.UP:
            case Direction.DOWN:
                return [new Coord(pos.x, 0), Direction.DOWN];
            case Direction.LEFT:
            case Direction.RIGHT:
                return [new Coord(0, pos.y), Direction.RIGHT];
            case Direction.UP_RIGHT:
            case Direction.DOWN_LEFT:
                return [new Coord(Math.max(0, (pos.x + pos.y) - 7), Math.min(7, pos.x + pos.y)), Direction.UP_RIGHT];
            default:
                Utils.expectToBeMultiple(dir, [Direction.UP_LEFT, Direction.DOWN_RIGHT]);
                return [
                    new Coord(pos.x - Math.min(pos.x, pos.y), pos.y - Math.min(pos.x, pos.y)),
                    Direction.DOWN_RIGHT,
                ];
        }
    }
    public static getVictory(state: LinesOfActionState): MGPOptional<Player> {
        // Returns a player in case of victory (NONE if it is a draw), otherwise an empty optional
        const [groupsZero, groupsOne]: [number, number] = LinesOfActionRules.getNumberOfGroups(state);
        if (groupsZero === 1 && groupsOne === 1) {
            return MGPOptional.of(Player.NONE);
        } else if (groupsZero === 1) {
            return MGPOptional.of(Player.ZERO);
        } else if (groupsOne === 1) {
            return MGPOptional.of(Player.ONE);
        } else {
            return MGPOptional.empty();
        }
    }
    public static possibleTargets(state: LinesOfActionState, start: Coord): Coord[] {
        const targets: Coord[] = [];
        for (const dir of Direction.DIRECTIONS) {
            const numberOfPiecesOnLine: number = LinesOfActionRules.numberOfPiecesOnLine(state, start, dir);
            const target: Coord = start.getNext(dir, numberOfPiecesOnLine);
            if (state.isOnBoard(target)) {
                const move: LinesOfActionMove = LinesOfActionMove.of(start, target).get();
                const legality: MGPFallible<void> = LinesOfActionRules.isLegal(move, state);
                if (legality.isSuccess()) {
                    targets.push(target);
                }
            }
        }
        return targets;
    }
    public getGameStatus(node: LinesOfActionNode): GameStatus {
        const state: LinesOfActionState = node.gameState;
        const [zero, one]: [number, number] = LinesOfActionRules.getNumberOfGroups(state);
        if (zero === 1 && one > 1) {
            return GameStatus.ZERO_WON;
        } else if (zero > 1 && one === 1) {
            return GameStatus.ONE_WON;
        } else {
            return GameStatus.ONGOING;
        }
    }
}
