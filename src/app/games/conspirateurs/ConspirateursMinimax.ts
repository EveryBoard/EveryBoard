import { Coord } from 'src/app/jscaip/Coord';
import { PlayerMetricsMinimax } from 'src/app/jscaip/Minimax';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveJump, ConspirateursMoveSimple } from './ConspirateursMove';
import { ConspirateursNode, ConspirateursRules } from './ConspirateursRules';
import { ConspirateursState } from './ConspirateursState';
import { MGPSet } from 'src/app/utils/MGPSet';

export class ConspirateursMinimax extends PlayerMetricsMinimax<ConspirateursMove, ConspirateursState> {
    public getListMoves(node: ConspirateursNode): ConspirateursMove[] {
        if (node.gameState.turn < 40) {
            return this.sortByNumberOfJump(this.getListMovesDrop(node.gameState));
        } else {
            return this.sortByNumberOfJump(this.getListMovesAfterDrop(node.gameState));
        }
    }
    public sortByNumberOfJump(moves: ConspirateursMove[]): ConspirateursMove[] {
        return moves.sort((a: ConspirateursMove, b: ConspirateursMove) => {
            const leftSize: number =
                ConspirateursMove.isDrop(a) ? 1 : (ConspirateursMove.isSimple(a) ? 2 : a.coords.length);
            const rightSize: number =
                ConspirateursMove.isDrop(b) ? 1 : (ConspirateursMove.isSimple(b) ? 2 : b.coords.length);
            return rightSize - leftSize;
        });
    }
    private getListMovesDrop(state: ConspirateursState): ConspirateursMoveDrop[] {
        const moves: ConspirateursMoveDrop[] = [];
        const start: Coord = ConspirateursState.CENTRAL_ZONE_TOP_LEFT;
        const end: Coord = ConspirateursState.CENTRAL_ZONE_BOTTOM_RIGHT;
        for (let y: number = start.y; y <= end.y; y++) {
            for (let x: number = start.x; x <= end.x; x++) {
                if (state.getPieceAtXY(x, y) === PlayerOrNone.NONE) {
                    moves.push(ConspirateursMoveDrop.from(new Coord(x, y)).get());
                }
            }
        }
        return moves;
    }
    private getListMovesAfterDrop(state: ConspirateursState): ConspirateursMove[] {
        let moves: ConspirateursMove[] = [];
        const currentPlayer: Player = state.getCurrentPlayer();
        for (let y: number = 0; y < ConspirateursState.HEIGHT; y++) {
            for (let x: number = 0; x < ConspirateursState.WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                if (state.getPieceAt(coord) === currentPlayer) {
                    moves = moves.concat(this.getListSimpleMoves(state, coord));
                    moves = moves.concat(this.getListJumps(state, coord));
                }
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
        ];
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
        for (const firstTarget of ConspirateursRules.get().jumpTargetsFrom(start)) {
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
    public getMetrics(node: ConspirateursNode): [number, number] {
        const state: ConspirateursState = node.gameState;
        const scores: [number, number] = [0, 0];
        for (let y: number = 0; y < ConspirateursState.HEIGHT; y++) {
            for (let x: number = 0; x < ConspirateursState.WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                const player: PlayerOrNone = state.getPieceAt(coord);
                if (player.isPlayer()) {
                    if (state.isShelter(coord)) {
                        scores[player.value] += 20;
                    } else {
                        let minEmptyShelterDistance: number = 100;
                        for (const shelter of ConspirateursState.ALL_SHELTERS) {
                            if (state.getPieceAt(shelter) === PlayerOrNone.NONE) {
                                const distance: number = coord.getOrthogonalDistance(shelter);
                                minEmptyShelterDistance = Math.min(minEmptyShelterDistance, distance);
                            }
                        }
                        scores[player.value] -= minEmptyShelterDistance;
                    }
                }
            }
        }
        return scores;
    }
}
