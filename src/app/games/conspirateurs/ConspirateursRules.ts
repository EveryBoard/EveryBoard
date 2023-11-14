import { Coord } from 'src/app/jscaip/Coord';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { GameNode } from 'src/app/jscaip/GameNode';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { MGPValidation } from '../../utils/MGPValidation';
import { ConspirateursFailure } from './ConspirateursFailure';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveJump, ConspirateursMoveSimple } from './ConspirateursMove';
import { ConspirateursState } from './ConspirateursState';
import { RulesConfig } from 'src/app/jscaip/RulesConfigUtil';
import { TableUtils } from 'src/app/utils/ArrayUtils';

export class ConspirateursNode extends GameNode<ConspirateursMove, ConspirateursState> {}

export class ConspirateursRules extends Rules<ConspirateursMove, ConspirateursState> {

    private static singleton: MGPOptional<ConspirateursRules> = MGPOptional.empty();

    public static get(): ConspirateursRules {
        if (ConspirateursRules.singleton.isAbsent()) {
            ConspirateursRules.singleton = MGPOptional.of(new ConspirateursRules());
        }
        return ConspirateursRules.singleton.get();
    }

    public getInitialState(): ConspirateursState {
        const board: PlayerOrNone[][] = TableUtils.create(ConspirateursState.WIDTH,
                                                          ConspirateursState.HEIGHT,
                                                          PlayerOrNone.NONE);
        return new ConspirateursState(board, 0);
    }

    public applyLegalMove(move: ConspirateursMove, state: ConspirateursState, _config: RulesConfig, _info: void)
    : ConspirateursState
    {
        const updatedBoard: PlayerOrNone[][] = state.getCopiedBoard();
        if (ConspirateursMove.isDrop(move)) {
            updatedBoard[move.coord.y][move.coord.x] = state.getCurrentPlayer();
        } else if (ConspirateursMove.isSimple(move)) {
            updatedBoard[move.getStart().y][move.getStart().x] = PlayerOrNone.NONE;
            updatedBoard[move.getEnd().y][move.getEnd().x] = state.getCurrentPlayer();
        } else {
            const start: Coord = move.getStartingCoord();
            const end: Coord = move.getEndingCoord();
            updatedBoard[start.y][start.x] = PlayerOrNone.NONE;
            updatedBoard[end.y][end.x] = state.getCurrentPlayer();
        }
        return new ConspirateursState(updatedBoard, state.turn + 1);
    }
    public isLegal(move: ConspirateursMove, state: ConspirateursState): MGPValidation {
        if (ConspirateursMove.isDrop(move)) {
            return this.dropLegality(move, state);
        } else if (ConspirateursMove.isSimple(move)) {
            return this.simpleMoveLegality(move, state);
        } else {
            return this.jumpLegality(move, state);
        }
    }
    public dropLegality(move: ConspirateursMoveDrop, state: ConspirateursState): MGPValidation {
        if (40 <= state.turn) {
            return MGPValidation.failure(ConspirateursFailure.CANNOT_DROP_AFTER_TURN_40());
        }
        if (state.getPieceAt(move.coord).isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        if (state.isCentralZone(move.coord) === false) {
            return MGPValidation.failure(ConspirateursFailure.MUST_DROP_IN_CENTRAL_ZONE());
        }
        return MGPValidation.SUCCESS;
    }
    public simpleMoveLegality(move: ConspirateursMoveSimple, state: ConspirateursState): MGPValidation {
        if (state.turn < 40) {
            return MGPValidation.failure(ConspirateursFailure.CANNOT_MOVE_BEFORE_TURN_40());
        }
        if (state.getPieceAt(move.getStart()) !== state.getCurrentPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        if (state.getPieceAt(move.getEnd()).isPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
        }
        return MGPValidation.SUCCESS;
    }
    public jumpLegality(move: ConspirateursMoveJump, state: ConspirateursState): MGPValidation {
        if (state.turn < 40) {
            return MGPValidation.failure(ConspirateursFailure.CANNOT_MOVE_BEFORE_TURN_40());
        }
        if (state.getPieceAt(move.getStartingCoord()) !== state.getCurrentPlayer()) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        for (const jumpedOver of move.getJumpedOverCoords()) {
            if (state.getPieceAt(jumpedOver) === PlayerOrNone.NONE) {
                return MGPValidation.failure(ConspirateursFailure.MUST_JUMP_OVER_PIECES());
            }
        }
        for (const landing of move.getLandingCoords()) {
            if (state.getPieceAt(landing).isPlayer()) {
                return MGPValidation.failure(RulesFailure.MUST_LAND_ON_EMPTY_SPACE());
            }
        }
        return MGPValidation.SUCCESS;
    }
    public jumpTargetsFrom(start: Coord): Coord[] {
        const targets: Coord[] = [
            new Coord(start.x + 2, start.y),
            new Coord(start.x - 2, start.y),
            new Coord(start.x, start.y + 2),
            new Coord(start.x, start.y - 2),
            new Coord(start.x + 2, start.y + 2),
            new Coord(start.x + 2, start.y - 2),
            new Coord(start.x - 2, start.y + 2),
            new Coord(start.x - 2, start.y - 2),
        ];
        const validTargets: Coord[] = [];
        for (const target of targets) {
            const move: MGPFallible<ConspirateursMoveJump> = ConspirateursMoveJump.from([start, target]);
            if (move.isSuccess()) {
                validTargets.push(target);
            }
        }
        return validTargets;
    }
    public nextJumps(jump: ConspirateursMoveJump, state: ConspirateursState): ConspirateursMoveJump[] {
        const ending: Coord = jump.getEndingCoord();
        const nextJumps: ConspirateursMoveJump[] = [];
        for (const target of this.jumpTargetsFrom(ending)) {
            const move: MGPFallible<ConspirateursMoveJump> = jump.addJump(target);
            if (move.isSuccess() && this.jumpLegality(move.get(), state).isSuccess()) {
                nextJumps.push(move.get());
            }
        }
        return nextJumps;
    }
    public jumpHasPossibleNextTargets(jump: ConspirateursMoveJump, state: ConspirateursState): boolean {
        return this.nextJumps(jump, state).length > 0;
    }
    public getGameStatus(node: ConspirateursNode): GameStatus {
        const state: ConspirateursState = node.gameState;
        const protectedPawns: [number, number] = [0, 0];
        for (const shelter of ConspirateursState.ALL_SHELTERS) {
            const content: PlayerOrNone = state.getPieceAt(shelter);
            if (content.isPlayer()) {
                protectedPawns[content.value] += 1;
                if (protectedPawns[content.value] === 20) {
                    return GameStatus.getVictory(content);
                }
            }
        }
        return GameStatus.ONGOING;
    }
}
