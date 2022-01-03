import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { MGPMap } from 'src/app/utils/MGPMap';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveJump, ConspirateursMoveSimple } from './ConspirateursMove';
import { ConspirateursNode, ConspirateursRules } from './ConspirateursRules';
import { ConspirateursState } from './ConspirateursState';
import { MGPSet } from 'src/app/utils/MGPSet';

export class ConspirateursMinimax extends Minimax<ConspirateursMove, ConspirateursState> {
    public getListMoves(node: ConspirateursNode): ConspirateursMove[] {
        if (node.gameState.turn < 40) {
            return this.getListMovesDrop(node.gameState);
        } else {
            return this.getListMovesAfterDrop(node.gameState);
        }
    }
    private getListMovesDrop(state: ConspirateursState): ConspirateursMoveDrop[] {
        const moves: ConspirateursMoveDrop[] = [];
        for (let y: number = ConspirateursState.CENTRAL_ZONE_TOP_LEFT.y; // eslint-disable-next-line indent
             y <= ConspirateursState.CENTRAL_ZONE_BOTTOM_RIGHT.y; // eslint-disable-next-line indent
             y++)
        {
            for (let x: number = ConspirateursState.CENTRAL_ZONE_TOP_LEFT.x; // eslint-disable-next-line indent
                 x <= ConspirateursState.CENTRAL_ZONE_BOTTOM_RIGHT.x; // eslint-disable-next-line indent
                 x++) {
                if (state.getPieceAtXY(x, y) === Player.NONE) {
                    moves.push(ConspirateursMoveDrop.of(new Coord(x, y)).get());
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
            const move: MGPFallible<ConspirateursMoveSimple> = ConspirateursMoveSimple.of(coord, target);
            if (move.isSuccess() && ConspirateursRules.get().simpleMoveLegality(move.get(), state).isSuccess()) {
                moves.push(move.get());
            }
        }
        return moves;
    }
    private getListJumps(state: ConspirateursState, start: Coord): ConspirateursMoveJump[] {
        const moves: MGPSet<ConspirateursMoveJump> = new MGPSet();
        for (const firstTarget of ConspirateursRules.get().jumpTargetsFrom(start)) {
            const jump: ConspirateursMoveJump = ConspirateursMoveJump.of([start, firstTarget]).get();
            if (ConspirateursRules.get().jumpLegality(jump, state).isSuccess()) {
                moves.add(jump);
                moves.union(this.getListJumpStartingFrom(state, jump));
            }
        }
        return moves.getCopy();
    }
    private getListJumpStartingFrom(state: ConspirateursState, jump: ConspirateursMoveJump)
    : MGPSet<ConspirateursMoveJump>
    {
        const nextJumps: ConspirateursMoveJump[] = ConspirateursRules.get().nextJumps(jump, state);
        const jumps: MGPSet<ConspirateursMoveJump> = new MGPSet(nextJumps);
        for (const nextJump of nextJumps) {
            jumps.union(this.getListJumpStartingFrom(state, nextJump));
        }
        return jumps;
    }
    public getBoardValue(node: ConspirateursNode): NodeUnheritance {
        const state: ConspirateursState = node.gameState;
        let score: number = 0;
        const piecesInShelters: MGPMap<Player, number> = new MGPMap();
        piecesInShelters.set(Player.ZERO, 0);
        piecesInShelters.set(Player.ONE, 0);
        for (let y: number = 0; y < ConspirateursState.HEIGHT; y++) {
            for (let x: number = 0; x < ConspirateursState.WIDTH; x++) {
                const coord: Coord = new Coord(x, y);
                const player: Player = state.getPieceAt(coord);
                if (player !== Player.NONE) {
                    const minDistanceToLeftOrTop: number = Math.min(x, y);
                    const minDistanceToRightOrBottom: number =
                        Math.min(ConspirateursState.WIDTH - x, ConspirateursState.HEIGHT - y);
                    const distanceToSide: number = Math.min(minDistanceToLeftOrTop, minDistanceToRightOrBottom);
                    score -= player.getScoreModifier() * distanceToSide;
                    if (state.isShelter(coord)) {
                        score += player.getScoreModifier() * 20;
                        piecesInShelters.replace(player, piecesInShelters.get(player).get() + 1);
                        if (piecesInShelters.get(player).get() === 20) {
                            return new NodeUnheritance(player.getVictoryValue());
                        }
                    }
                }
            }
        }
        return new NodeUnheritance(score);
    }
}
