import { Coord } from 'src/app/jscaip/Coord';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveJump, ConspirateursMoveSimple } from './ConspirateursMove';
import { ConspirateursNode, ConspirateursRules } from './ConspirateursRules';
import { ConspirateursState } from './ConspirateursState';
import { MGPSet } from 'src/app/utils/MGPSet';
import { MoveGenerator } from 'src/app/jscaip/AI/AI';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';

export class ConspirateursMoveGenerator extends MoveGenerator<ConspirateursMove, ConspirateursState> {

    public override getListMoves(node: ConspirateursNode, _config: NoConfig): ConspirateursMove[] {
        if (node.gameState.turn < 40) {
            return this.getListMovesDrop(node.gameState);
        } else {
            return this.getListMovesAfterDrop(node.gameState);
        }
    }

    private getListMovesDrop(state: ConspirateursState): ConspirateursMoveDrop[] {
        const moves: ConspirateursMoveDrop[] = [];
        const start: Coord = ConspirateursState.CENTRAL_ZONE_TOP_LEFT;
        const end: Coord = ConspirateursState.CENTRAL_ZONE_BOTTOM_RIGHT;
        for (let y: number = start.y; y <= end.y; y++) {
            for (let x: number = start.x; x <= end.x; x++) {
                if (state.getPieceAtXY(x, y).isNone()) {
                    moves.push(ConspirateursMoveDrop.of(new Coord(x, y)));
                }
            }
        }
        return moves;
    }

    private getListMovesAfterDrop(state: ConspirateursState): ConspirateursMove[] {
        let moves: ConspirateursMove[] = [];
        const currentPlayer: Player = state.getCurrentPlayer();
        for (const coordAndContent of state.getCoordsAndContents()) {
            if (coordAndContent.content === currentPlayer) {
                moves = moves.concat(this.getListSimpleMoves(state, coordAndContent.coord));
                moves = moves.concat(this.getListJumps(state, coordAndContent.coord));
            }
        }
        return moves;
    }

    private getListSimpleMoves(state: ConspirateursState, coord: Coord): ConspirateursMoveSimple[] {
        const moves: ConspirateursMoveSimple[] = [];
        const targets: Coord[] = [
            new Coord(coord.x + 1, coord.y),
            new Coord(coord.x - 1, coord.y),
            new Coord(coord.x, coord.y + 1),
            new Coord(coord.x, coord.y - 1),
            new Coord(coord.x + 1, coord.y + 1),
            new Coord(coord.x + 1, coord.y - 1),
            new Coord(coord.x - 1, coord.y + 1),
            new Coord(coord.x - 1, coord.y - 1),
        ].filter((coord: Coord) => state.isOnBoard(coord));
        for (const target of targets) {
            const move: MGPFallible<ConspirateursMoveSimple> = ConspirateursMoveSimple.from(coord, target);
            if (move.isSuccess() && ConspirateursRules.get().simpleMoveLegality(move.get(), state).isSuccess()) {
                moves.push(move.get());
            }
        }
        return moves;
    }

    private getListJumps(state: ConspirateursState, start: Coord): ConspirateursMoveJump[] {
        const moves: MGPSet<ConspirateursMoveJump> = new MGPSet();
        for (const firstTarget of ConspirateursRules.get().jumpTargetsFrom(state, start)) {
            const jump: ConspirateursMoveJump = ConspirateursMoveJump.from([start, firstTarget]).get();
            if (ConspirateursRules.get().jumpLegality(jump, state).isSuccess()) {
                moves.add(jump);
                moves.addAll(this.getListJumpStartingFrom(state, jump));
            }
        }
        return moves.toList();
    }

    private getListJumpStartingFrom(state: ConspirateursState, jump: ConspirateursMoveJump)
    : MGPSet<ConspirateursMoveJump>
    {
        const nextJumps: ConspirateursMoveJump[] = ConspirateursRules.get().nextJumps(jump, state);
        const jumps: MGPSet<ConspirateursMoveJump> = new MGPSet(nextJumps);
        for (const nextJump of nextJumps) {
            jumps.addAll(this.getListJumpStartingFrom(state, nextJump));
        }
        return jumps;
    }

}
