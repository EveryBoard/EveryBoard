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
}

export abstract class LinesOfActionNode extends MGPNode<LinesOfActionRules, LinesOfActionMove, LinesOfActionState, LegalityStatus> {}

export class LinesOfActionRules extends Rules<LinesOfActionMove, LinesOfActionState, LegalityStatus> {
    public getListMoves(node: LinesOfActionNode): MGPMap<LinesOfActionMove, LinesOfActionState> {
        throw new Error('Method not implemented.');
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
            for (let x: number = 0; y < LinesOfActionState.SIZE; y++) {
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
        while (stack !== []) {
            const coord: Coord = stack.pop();
            if (groups[coord.y][coord.x] === -1) {
                const content: number = state.getAt(coord);
                if (content === player) {
                    groups[coord.y][coord.x] = id;
                } else if (content === Player.NONE.value) {
                    groups[coord.y][coord.x] = 0;
                }
                for (const dir of Direction.DIRECTIONS) {
                    stack.push(pos.getNext(dir));
                }
            }
        }
    }
    public applyLegalMove(move: LinesOfActionMove, state: LinesOfActionState, status: LegalityStatus)
    : { resultingMove: LinesOfActionMove; resultingSlice: LinesOfActionState } {
        const board: number[][] = state.getCopiedBoard();
        board[move.coord.y][move.coord.x] = Player.NONE.value;
        board[move.end.y][move.end.x] = state.getCurrentPlayer().value;

        return {
            resultingMove: move,
            resultingSlice: new LinesOfActionState(board, state.turn+1),
        };
    }
    public isLegal(move: LinesOfActionMove, state: LinesOfActionState): LegalityStatus {
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
        let current: Coord = this.getEntrance(pos, dir);
        const coords: Coord[] = [];
        while (LinesOfActionState.isOnBoard(current)) {
            coords.push(current);
            current = current.getNext(dir);
        }
        return coords;
    }
    private getEntrance(pos: Coord, dir: Direction): Coord {
        switch (dir) {
            case Direction.UP:
            case Direction.DOWN:
                return new Coord(pos.x, 0);
            case Direction.LEFT:
            case Direction.RIGHT:
                return new Coord(0, pos.y);
            case Direction.UP_RIGHT:
            case Direction.DOWN_LEFT:
                return new Coord(pos.x - Math.min(pos.x, pos.y), pos.y - Math.min(pos.x, pos.y));
            case Direction.UP_LEFT:
            case Direction.DOWN_RIGHT:
                return new Coord(Math.min(7, pos.x + pos.y), Math.max(0, (pos.x + pos.y) - 7));
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
}
