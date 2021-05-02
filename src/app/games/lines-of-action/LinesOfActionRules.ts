import { Coord } from 'src/app/jscaip/coord/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/mgp-node/MGPNode';
import { Player } from 'src/app/jscaip/player/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { ArrayUtils } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { MGPOptional } from 'src/app/utils/mgp-optional/MGPOptional';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionState } from './LinesOfActionState';

export class LinesOfActionFailure {
    public static INVALID_MOVE_LENGTH: string =
        `Vous devez vous effectuer un déplacement de longueur égale
         au nombre de pièces présente sur la ligne de votre déplacement.`
    public static CANNOT_JUMP_OVER_ENEMY: string = `Vous ne pouvez pas passer au dessus d'une pièce ennemie.`;
    public static BUSY_TARGET: string = `Votre case d'arrivée doit être vide ou contenir une pièce ennemie.`;
    public static NOT_YOUR_PIECE: string = `Veuillez sélectionner une de vos propres pièces.`;
    public static PIECE_CANNOT_MOVE: string = `Cette pièce n'a aucun mouvement possible, choisissez-en une autre.`;
    public static INVALID_DIRECTION: string =
        `Un mouvement dois se faire selon une direction orthogonale ou diagonale.`;
}

export class LinesOfActionNode extends MGPNode<LinesOfActionRules,
                                               LinesOfActionMove,
                                               LinesOfActionState,
                                               LegalityStatus> {}

export class LinesOfActionRules extends Rules<LinesOfActionMove, LinesOfActionState> {
    public getListMoves(node: LinesOfActionNode): MGPMap<LinesOfActionMove, LinesOfActionState> {
        return this.getListMovesFromState(node.gamePartSlice);
    }
    public getListMovesFromState(state: LinesOfActionState): MGPMap<LinesOfActionMove, LinesOfActionState> {
        const map: MGPMap<LinesOfActionMove, LinesOfActionState> = new MGPMap();

        if (this.getVictory(state).isPresent()) {
            return map;
        }

        for (let y: number = 0; y < LinesOfActionState.SIZE; y++) {
            for (let x: number = 0; x < LinesOfActionState.SIZE; x++) {
                const coord: Coord = new Coord(x, y);
                const piece: number = state.getAt(coord);
                if (piece !== Player.NONE.value) {
                    for (const target of this.possibleTargets(state, coord)) {
                        const move: LinesOfActionMove = new LinesOfActionMove(coord, target);
                        const status: LegalityStatus = this.isLegal(move, state);
                        // This move is legal by construction
                        const newState: LinesOfActionState = this.applyLegalMove(move, state, status);
                        map.set(move, newState);
                    }
                }
            }
        }
        return map;
    }
    public getBoardValue(move: LinesOfActionMove, state: LinesOfActionState): number {
        const [zero, one]: [number, number] = this.getNumberOfGroups(state);
        if (zero === 1 && one > 1) {
            return Player.ZERO.getVictoryValue();
        } else if (zero > 1 && one === 1) {
            return Player.ONE.getVictoryValue();
        } else {
            // More groups = less score
            return (100 / zero) * Player.ZERO.getScoreModifier() + (100 / one) * Player.ONE.getScoreModifier();
        }
    }
    private getNumberOfGroups(state: LinesOfActionState): [number, number] {
        const groups: number[][] = ArrayUtils.createBiArray(LinesOfActionState.SIZE, LinesOfActionState.SIZE, -1);
        const numGroups: [number, number] = [0, 0];
        let highestGroup: number = 0;
        for (let y: number = 0; y < LinesOfActionState.SIZE; y++) {
            for (let x: number = 0; x < LinesOfActionState.SIZE; x++) {
                if (groups[y][x] === -1) {
                    const content: number = state.getAt(new Coord(x, y));
                    if (content !== Player.NONE.value) {
                        highestGroup += 1;
                        this.markGroupStartingAt(state, groups, new Coord(x, y), highestGroup);
                        numGroups[content] += 1;
                    }
                }
            }
        }
        return numGroups;
    }
    private markGroupStartingAt(state: LinesOfActionState, groups: number[][], pos: Coord, id: number): void {
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
    public isLegal(move: LinesOfActionMove, state: LinesOfActionState): LegalityStatus {
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
            return { legal: MGPValidation.failure(LinesOfActionFailure.BUSY_TARGET) };
        }
        return { legal: MGPValidation.SUCCESS };
    }
    private numberOfPiecesOnLine(state: LinesOfActionState, pos: Coord, dir: Direction): number {
        let count: number = 0;
        for (const coord of this.getLineCoords(pos, dir)) {
            if (state.getAt(coord) !== Player.NONE.value) {
                count += 1;
            }
        }
        return count;
    }
    private getLineCoords(pos: Coord, dir: Direction): Coord[] {
        const entranceAndDir: [Coord, Direction] = this.getEntranceAndForwardDirection(pos, dir);
        let current: Coord = entranceAndDir[0];
        const forwardDirection: Direction = entranceAndDir[1];
        const coords: Coord[] = [];
        while (LinesOfActionState.isOnBoard(current)) {
            coords.push(current);
            current = current.getNext(forwardDirection);
        }
        return coords;
    }
    private getEntranceAndForwardDirection(pos: Coord, dir: Direction): [Coord, Direction] {
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
    public getVictory(state: LinesOfActionState): MGPOptional<Player> {
        // Returns a player in case of victory (NONE if it is a draw), otherwise an empty optional
        const [groupsZero, groupsOne]: [number, number] = this.getNumberOfGroups(state);
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
    public possibleTargets(state: LinesOfActionState, start: Coord): Coord[] {
        const targets: Coord[] = [];
        for (const dir of Direction.DIRECTIONS) {
            const numberOfPiecesOnLine: number = this.numberOfPiecesOnLine(state, start, dir);
            const target: Coord = start.getNext(dir, numberOfPiecesOnLine);
            if (LinesOfActionState.isOnBoard(target)) {
                const move: LinesOfActionMove = new LinesOfActionMove(start, target);
                const legality: LegalityStatus = this.isLegal(move, state);
                if (legality.legal.isSuccess()) {
                    targets.push(target);
                }
            }
        }
        return targets;
    }
}
