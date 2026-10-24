import { MGPOptional, MGPValidation, Utils } from '@everyboard/lib';

import { EmptyRulesConfig } from '../../config/RulesConfig';
import { GameNode } from '../../jscaip/AI/GameNode';
import { Coord } from '../../jscaip/Coord';
import { CoordSet } from '../../jscaip/CoordSet';
import { EightDirection } from '../../jscaip/EightDirection';
import { GameStatus } from '../../jscaip/GameStatus';
import { Player, PlayerOrNone } from '../../jscaip/Player';
import { PlayerNumberMap } from '../../jscaip/PlayerMap';
import { Rules } from '../../jscaip/Rules';
import { RulesFailure } from '../../jscaip/RulesFailure';
import { TableUtils } from '../../jscaip/TableUtils';

import { LinesOfActionFailure } from './LinesOfActionFailure';
import { LinesOfActionMove } from './LinesOfActionMove';
import { LinesOfActionState } from './LinesOfActionState';

export class LinesOfActionNode extends GameNode<LinesOfActionMove, LinesOfActionState> {}

export class LinesOfActionRules extends Rules<LinesOfActionMove, LinesOfActionState> {

    private static singleton: MGPOptional<LinesOfActionRules> = MGPOptional.empty();

    public static get(): LinesOfActionRules {
        if (LinesOfActionRules.singleton.isAbsent()) {
            LinesOfActionRules.singleton = MGPOptional.of(new LinesOfActionRules());
        }
        return LinesOfActionRules.singleton.get();
    }

    public override getInitialState(): LinesOfActionState {
        const _: PlayerOrNone = PlayerOrNone.NONE;
        const O: PlayerOrNone = PlayerOrNone.ZERO;
        const X: PlayerOrNone = PlayerOrNone.ONE;
        const board: PlayerOrNone[][] = [
            [_, O, O, O, O, O, O, _],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [X, _, _, _, _, _, _, X],
            [_, O, O, O, O, O, O, _],
        ];
        return new LinesOfActionState(board, 0);
    }

    public static getNumberOfGroups(state: LinesOfActionState): PlayerNumberMap {
        const groups: number[][] = TableUtils.create(LinesOfActionState.SIZE, LinesOfActionState.SIZE, -1);
        const numGroups: PlayerNumberMap = PlayerNumberMap.of(0, 0);
        let highestGroup: number = 0;
        for (const coordAndContent of state.getCoordsAndContents()) {
            if (groups[coordAndContent.coord.y][coordAndContent.coord.x] === -1) {
                if (coordAndContent.content.isPlayer()) {
                    highestGroup += 1;
                    LinesOfActionRules.markGroupStartingAt(state, groups, coordAndContent.coord, highestGroup);
                    numGroups.add(coordAndContent.content, 1);
                }
            }
        }
        return numGroups;
    }

    private static markGroupStartingAt(state: LinesOfActionState, groups: number[][], pos: Coord, id: number): void {
        const stack: Coord[] = [pos];
        const player: PlayerOrNone = state.getPieceAt(pos);
        while (stack.length > 0) {
            const coord: Coord = Utils.getNonNullable(stack.pop());
            if (groups[coord.y][coord.x] === -1) {
                const content: PlayerOrNone = state.getPieceAt(coord);
                if (content === player) {
                    groups[coord.y][coord.x] = id;
                    for (const dir of EightDirection.EIGHT_DIRECTIONS) {
                        const next: Coord = coord.getNext(dir);
                        if (state.isOnBoard(next)) {
                            stack.push(next);
                        }
                    }
                } else if (content.isNone()) {
                    groups[coord.y][coord.x] = 0;
                }
            }
        }
    }

    public override applyLegalMove(
        move: LinesOfActionMove,
        state: LinesOfActionState,
        _config: EmptyRulesConfig,
        _info: void,
    ): LinesOfActionState {
        const board: PlayerOrNone[][] = state.getCopiedBoard();
        board[move.getStart().y][move.getStart().x] = PlayerOrNone.NONE;
        board[move.getEnd().y][move.getEnd().x] = state.getCurrentPlayer();

        return new LinesOfActionState(board, state.turn + 1);
    }

    public static isLegal(move: LinesOfActionMove, state: LinesOfActionState): MGPValidation {
        const piece: PlayerOrNone = state.getPieceAt(move.getStart());
        if (piece.isNone()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_EMPTY());
        }
        if (piece === state.getCurrentOpponent()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_OWN_PIECE_NOT_OPPONENT());
        }
        if (move.getDistance() !== this.numberOfPiecesOnLine(state, move.getStart(), move.direction)) {
            return MGPValidation.failure(LinesOfActionFailure.INVALID_MOVE_LENGTH());
        }
        if (move.getJumpedOverCoords().some((c: Coord) =>
            state.getPieceAt(c) === state.getCurrentOpponent()))
        {
            return MGPValidation.failure(LinesOfActionFailure.CANNOT_JUMP_OVER_OPPONENT());
        }
        if (state.getPieceAt(move.getEnd()) === state.getCurrentPlayer()) {
            return MGPValidation.failure(RulesFailure.SHOULD_LAND_ON_EMPTY_OR_OPPONENT_SPACE());
        }
        return MGPValidation.SUCCESS;
    }

    public override isLegal(move: LinesOfActionMove, state: LinesOfActionState): MGPValidation {
        return LinesOfActionRules.isLegal(move, state);
    }

    private static numberOfPiecesOnLine(state: LinesOfActionState, pos: Coord, dir: EightDirection): number {
        let count: number = 0;
        for (const coord of LinesOfActionRules.getLineCoords(pos, dir)) {
            if (state.getPieceAt(coord).isPlayer()) {
                count += 1;
            }
        }
        return count;
    }

    private static getLineCoords(pos: Coord, dir: EightDirection): Coord[] {
        const entranceAndDir: [Coord, EightDirection] = LinesOfActionRules.getEntranceAndForwardDirection(pos, dir);
        let current: Coord = entranceAndDir[0];
        const forwardDirection: EightDirection = entranceAndDir[1];
        const coords: Coord[] = [];
        while (LinesOfActionState.isOnBoard(current)) {
            coords.push(current);
            current = current.getNext(forwardDirection);
        }
        return coords;
    }

    private static getEntranceAndForwardDirection(pos: Coord, dir: EightDirection): [Coord, EightDirection] {
        switch (dir) {
            case EightDirection.UP:
            case EightDirection.DOWN:
                return [new Coord(pos.x, 0), EightDirection.DOWN];
            case EightDirection.LEFT:
            case EightDirection.RIGHT:
                return [new Coord(0, pos.y), EightDirection.RIGHT];
            case EightDirection.UP_RIGHT:
            case EightDirection.DOWN_LEFT:
                return [
                    new Coord(
                        Math.max(0, (pos.x + pos.y) - 7),
                        Math.min(7, pos.x + pos.y),
                    ),
                    EightDirection.UP_RIGHT,
                ];
            default:
                Utils.expectToBeMultiple(dir, [EightDirection.UP_LEFT, EightDirection.DOWN_RIGHT]);
                return [
                    new Coord(pos.x - Math.min(pos.x, pos.y), pos.y - Math.min(pos.x, pos.y)),
                    EightDirection.DOWN_RIGHT,
                ];
        }
    }

    public static getVictory(state: LinesOfActionState): MGPOptional<PlayerOrNone> {
        // Returns a player in case of victory (NONE if it is a draw), otherwise an empty optional
        const groups: PlayerNumberMap = LinesOfActionRules.getNumberOfGroups(state);
        const groupsZero: number = groups.get(Player.ZERO);
        const groupsOne: number = groups.get(Player.ONE);
        if (groupsZero === 1 && groupsOne === 1) {
            return MGPOptional.of(PlayerOrNone.NONE);
        } else if (groupsZero === 1) {
            return MGPOptional.of(Player.ZERO);
        } else if (groupsOne === 1) {
            return MGPOptional.of(Player.ONE);
        } else {
            return MGPOptional.empty();
        }
    }

    public static possibleTargets(state: LinesOfActionState, start: Coord): CoordSet {
        let targets: CoordSet = new CoordSet();
        for (const dir of EightDirection.EIGHT_DIRECTIONS) {
            const numberOfPiecesOnLine: number = LinesOfActionRules.numberOfPiecesOnLine(state, start, dir);
            const target: Coord = start.getNext(dir, numberOfPiecesOnLine);
            if (state.isOnBoard(target)) {
                const move: LinesOfActionMove = LinesOfActionMove.from(start, target).get();
                const legality: MGPValidation = LinesOfActionRules.isLegal(move, state);
                if (legality.isSuccess()) {
                    targets = targets.addElement(target);
                }
            }
        }
        return targets;
    }

    public override getGameStatus(node: LinesOfActionNode): GameStatus {
        const state: LinesOfActionState = node.gameState;
        const groups: PlayerNumberMap = LinesOfActionRules.getNumberOfGroups(state);
        const zero: number = groups.get(Player.ZERO);
        const one: number = groups.get(Player.ONE);
        if (zero === 1 && one > 1) {
            return GameStatus.ZERO_WON;
        } else if (zero > 1 && one === 1) {
            return GameStatus.ONE_WON;
        } else {
            return GameStatus.ONGOING;
        }
    }

}
