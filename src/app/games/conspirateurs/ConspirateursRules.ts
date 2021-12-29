import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { ConspirateursFailure } from './ConspirateursFailure';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveJump, ConspirateursMoveSimple } from './ConspirateursMove';
import { ConspirateursState } from './ConspirateursState';

export class ConspirateursNode extends MGPNode<ConspirateursRules, ConspirateursMove, ConspirateursState> { }

export class ConspirateursRules extends Rules<ConspirateursMove, ConspirateursState> {

    private static singleton: MGPOptional<ConspirateursRules> = MGPOptional.empty();
    public static get(): ConspirateursRules {
        if (ConspirateursRules.singleton.isAbsent()) {
            ConspirateursRules.singleton = MGPOptional.of(new ConspirateursRules());
        }
        return ConspirateursRules.singleton.get();
    }

    private constructor() {
        super(ConspirateursState);
    }

    public applyLegalMove(move: ConspirateursMove, state: ConspirateursState, _info: void): ConspirateursState {
        const updatedBoard: Player[][] = state.getCopiedBoard();
        if (move.isDrop()) {
            updatedBoard[move.coord.y][move.coord.x] = state.getCurrentPlayer();
        } else if (move.isSimple()) {
            updatedBoard[move.coord.y][move.coord.x] = Player.NONE;
            updatedBoard[move.end.y][move.end.x] = state.getCurrentPlayer();
        } else {
            const start: Coord = move.getStartingCoord();
            const end: Coord = move.getEndingCoord();
            updatedBoard[start.y][start.x] = Player.NONE;
            updatedBoard[end.y][end.x] = state.getCurrentPlayer();
        }
        return new ConspirateursState(updatedBoard, state.turn+1);
    }
    public isLegal(move: ConspirateursMove, state: ConspirateursState): MGPFallible<void> {
        if (move.isDrop()) {
            return this.dropLegality(move, state);
        } else if (move.isSimple()) {
            return this.simpleMoveLegality(move, state);
        } else {
            return this.jumpLegality(move, state);
        }
    }
    public dropLegality(move: ConspirateursMoveDrop, state: ConspirateursState): MGPFallible<void> {
        if (state.turn >= 40) {
            return MGPFallible.failure(ConspirateursFailure.CANNOT_DROP_AFTER_TURN_40());
        }
        if (state.getPieceAt(move.coord) !== Player.NONE) {
            return MGPFallible.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        if (state.isCentralZone(move.coord) === false) {
            return MGPFallible.failure(ConspirateursFailure.MUST_DROP_IN_CENTRAL_ZONE());
        }
        return MGPFallible.success(undefined);
    }
    public simpleMoveLegality(move: ConspirateursMoveSimple, state: ConspirateursState): MGPFallible<void> {

        if (state.turn < 40) {
            return MGPFallible.failure(ConspirateursFailure.CANNOT_MOVE_BEFORE_TURN_40());
        }
        if (state.getPieceAt(move.coord) !== state.getCurrentPlayer()) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        if (state.getPieceAt(move.end) !== Player.NONE) {
            return MGPFallible.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        return MGPFallible.success(undefined);
    }
    public jumpLegality(move: ConspirateursMoveJump, state: ConspirateursState): MGPFallible<void> {
        if (state.turn < 40) {
            return MGPFallible.failure(ConspirateursFailure.CANNOT_MOVE_BEFORE_TURN_40());
        }
        if (state.getPieceAt(move.getStartingCoord()) !== state.getCurrentPlayer()) {
            return MGPFallible.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        for (const jumpedOver of move.getJumpedOverCoords()) {
            if (state.getPieceAt(jumpedOver) === Player.NONE) {
                return MGPFallible.failure(ConspirateursFailure.MUST_JUMP_OVER_PIECES());
            }
        }
        for (const landing of move.getLandingCoords()) {
            if (state.getPieceAt(landing) !== Player.NONE) {
                return MGPFallible.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
            }
        }
        return MGPFallible.success(undefined);
    }
    public nextJumpTargets(jump: ConspirateursMoveJump, state: ConspirateursState): ConspirateursMoveJump[] {
        const ending: Coord = jump.getEndingCoord();
        const targets: Coord[] = [
            new Coord(ending.x + 1, ending.y),
            new Coord(ending.x - 1, ending.y),
            new Coord(ending.x, ending.y + 1),
            new Coord(ending.x, ending.y - 1),
            new Coord(ending.x + 1, ending.y + 1),
            new Coord(ending.x + 1, ending.y - 1),
            new Coord(ending.x - 1, ending.y + 1),
            new Coord(ending.x - 1, ending.y - 1),
        ];
        const nextJumps: ConspirateursMoveJump[] = [];
        for (const target of targets) {
            const move: MGPFallible<ConspirateursMoveJump> = jump.addJump(target);
            if (move.isSuccess()) {
                nextJumps.push(move.get());
            }
        }
        return nextJumps;
    }
    public jumpHasPossibleNextTargets(jump: ConspirateursMoveJump, state: ConspirateursState): boolean {
        return this.nextJumpTargets(jump, state).length > 0;
    }
    public getGameStatus(node: ConspirateursNode): GameStatus {
        const state: ConspirateursState = node.gameState;
        const protectedPawns: [number, number] = [0, 0];
        for (const shelter of ConspirateursState.ALL_SHELTERS) {
            const content: Player = state.getPieceAt(shelter);
            if (content !== Player.NONE) {
                protectedPawns[content.value] += 1;
                if (protectedPawns[content.value] === 20) {
                    return GameStatus.getVictory(content);
                }
            }
        }
        return GameStatus.ONGOING;
    }
}
