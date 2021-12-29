import { Coord } from 'src/app/jscaip/Coord';
import { Minimax } from 'src/app/jscaip/Minimax';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { ConspirateursMove, ConspirateursMoveDrop, ConspirateursMoveJump, ConspirateursMoveSimple } from './ConspirateursMove';
import { ConspirateursNode, ConspirateursRules } from './ConspirateursRules';
import { ConspirateursState } from './ConspirateursState';

export class ConspirateursMinimax extends Minimax<ConspirateursMove, ConspirateursState> {
    public getListMoves(node: ConspirateursNode): ConspirateursMove[] {
        if (node.gameState.turn >= 40) {
            return this.getListMovesAfterDrop(node.gameState);
        } else {
            return this.getListMovesBeforeDrop(node.gameState);
        }
    }
    private getListMovesBeforeDrop(state: ConspirateursState): ConspirateursMoveDrop[] {
        const moves: ConspirateursMoveDrop[] = [];
        for (let y: number = ConspirateursState.CENTRAL_ZONE_TOP_LEFT.y;
            y <= ConspirateursState.CENTRAL_ZONE_BOTTOM_RIGHT.y;
            y++) {
            for (let x: number = ConspirateursState.CENTRAL_ZONE_TOP_LEFT.x;
                x <= ConspirateursState.CENTRAL_ZONE_BOTTOM_RIGHT.x;
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
        let moves: ConspirateursMoveJump[] = [];
        for (const firstTarget of ConspirateursRules.get().jumpTargetsFrom(start)) {
            const jump: ConspirateursMoveJump = ConspirateursMoveJump.of([start, firstTarget]).get();
            moves.push(jump);
            moves = moves.concat(this.getListJumpStartingFrom(state, jump));
        }
        return moves;
    }
    private getListJumpStartingFrom(state: ConspirateursState, jump: ConspirateursMoveJump): ConspirateursMoveJump[] {
        const nextJumps: ConspirateursMoveJump[] = ConspirateursRules.get().nextJumps(jump, state);
        if (nextJumps === []) {
            return nextJumps;
        } else {
            let jumps: ConspirateursMoveJump[] = [];
            for (const nextJump of nextJumps) {
                jumps.push(nextJump);
                jumps = jumps.concat(this.getListJumpStartingFrom(state, nextJump));
            }
            return jumps;
        }
    }
    public getBoardValue(node: ConspirateursNode): NodeUnheritance {
        // Assign a higher value the closer the piece to the 
        throw new Error('Method not implemented.');
    }
}
