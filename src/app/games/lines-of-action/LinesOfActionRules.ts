import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { LinesOfActionFailure } from './LinesOfActionFailure';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionState } from './LinesOfActionState';

export class LinesOfActionNode extends MGPNode<LinesOfActionRules,
                                               LinesOfActionMove,
                                               LinesOfActionState,
                                               LegalityStatus> {}


export class LinesOfActionRules extends Rules<LinesOfActionMove, LinesOfActionState> {

    public static getListMovesFromState(state: LinesOfActionState): LinesOfActionMove[] {
        const moves: LinesOfActionMove[] = [];

        if (LinesOfActionRules.getVictory(state).isPresent()) {
            return moves;
        }

        for (let y: number = 0; y < LinesOfActionState.SIZE; y++) {
            for (let x: number = 0; x < LinesOfActionState.SIZE; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: number = state.getAt(coord);
                if (piece !== Player.NONE.value) {
                    for (const target of LinesOfActionRules.possibleTargets(state, coord)) {
                        const move: LinesOfActionMove = new LinesOfActionMove(coord, target);
                        moves.push(move);
                    }
                }
            }
        }
        return moves;
    }
    public static getNumberOfGroups(state: LinesOfActionState): [number, number] {
        const groups: number[][] = ArrayUtils.createBiArray(LinesOfActionState.SIZE, LinesOfActionState.SIZE, -1);
        const numGroups: [number, number] = [0, 0];
        let highestGroup: number = 0;
        for (let y: number = 0; y < LinesOfActionState.SIZE; y++) {
            for (let x: number = 0; x < LinesOfActionState.SIZE; x++) {
                if (groups[y][x] === -1) {
                    const content: number = state.getAt(new Coord(x, y));
                    if (content !== Player.NONE.value) {
                        highestGroup += 1;
                        LinesOfActionRules.markGroupStartingAt(state, groups, new Coord(x, y), highestGroup);
                        numGroups[content] += 1;
                    }
                }
            }
        }
        return numGroups;
    }
    private static markGroupStartingAt(state: LinesOfActionState, groups: number[][], pos: Coord, id: number): void {
        const stack: Coord[] = [pos];
        const player: number = state.getAt(pos);
        while (stack.length > 0) {
            const coord: Coord = stack.pop();
            if (groups[coord.y][coord.x] === -1) {
                const content: number = state.getAt(coord);
                if (content === player) {
                    groups[coord.y][coord.x] = id;
                    for (const dir of Direction.DIRECTIONS) {
                        const next: Coord = coord.getNext(dir);
                        if (LinesOfActionState.isOnBoard(next)) {
                            stack.push(next);
                        }
                    }
                } else if (content === Player.NONE.value) {
                    groups[coord.y][coord.x] = 0;
                }
            }
        }
    }
    public applyLegalMove(move: LinesOfActionMove,
                          state: LinesOfActionState,
                          status: LegalityStatus)
    : LinesOfActionState
    {
        const board: number[][] = state.getCopiedBoard();
        board[move.coord.y][move.coord.x] = Player.NONE.value;
        board[move.end.y][move.end.x] = state.getCurrentPlayer().value;

        return new LinesOfActionState(board, state.turn + 1);
    }
    public static isLegal(move: LinesOfActionMove, state: LinesOfActionState): LegalityStatus {
        if (state.getAt(move.coord) !== state.getCurrentPlayer().value) {
            return { legal: MGPValidation.failure(LinesOfActionFailure.NOT_YOUR_PIECE) };
        }
        if (move.length() !== this.numberOfPiecesOnLine(state, move.coord, move.direction)) {
            return { legal: MGPValidation.failure(LinesOfActionFailure.INVALID_MOVE_LENGTH) };
        }
        if (move.coord.getCoordsToward(move.end).some((c: Coord) =>
            state.getAt(c) === state.getCurrentEnnemy().value)) {
            return { legal: MGPValidation.failure(LinesOfActionFailure.CANNOT_JUMP_OVER_ENEMY) };
        }
        if (state.getAt(move.end) === state.getCurrentPlayer().value) {
            return { legal: MGPValidation.failure(RulesFailure.CANNOT_SELF_CAPTURE) };
        }
        return { legal: MGPValidation.SUCCESS };
    }
    public isLegal(move: LinesOfActionMove, state: LinesOfActionState): LegalityStatus {
        return LinesOfActionRules.isLegal(move, state);
    }
    private static numberOfPiecesOnLine(state: LinesOfActionState, pos: Coord, dir: Direction): number {
        let count: number = 0;
        for (const coord of LinesOfActionRules.getLineCoords(pos, dir)) {
            if (state.getAt(coord) !== Player.NONE.value) {
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
            case Direction.UP_LEFT:
            case Direction.DOWN_RIGHT:
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
            if (LinesOfActionState.isOnBoard(target)) {
                const move: LinesOfActionMove = new LinesOfActionMove(start, target);
                const legality: LegalityStatus = LinesOfActionRules.isLegal(move, state);
                if (legality.legal.isSuccess()) {
                    targets.push(target);
                }
            }
        }
        return targets;
    }
    public getGameStatus(state: LinesOfActionState): GameStatus {
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
