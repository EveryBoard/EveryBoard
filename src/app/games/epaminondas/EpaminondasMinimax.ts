import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { Player } from 'src/app/jscaip/Player';
import { EpaminondasLegalityStatus } from './epaminondaslegalitystatus';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasPartSlice } from './EpaminondasPartSlice';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Minimax } from 'src/app/jscaip/Minimax';
import { EpaminondasNode, EpaminondasRules } from './EpaminondasRules';
import { ArrayUtils } from 'src/app/utils/ArrayUtils';


export class EpaminondasMinimax extends Minimax<EpaminondasMove, EpaminondasPartSlice, EpaminondasLegalityStatus> {

    public getListMoves(node: EpaminondasNode): EpaminondasMove[] {
        const PLAYER: number = node.gamePartSlice.getCurrentPlayer().value;
        const ENNEMY: number = node.gamePartSlice.getCurrentEnnemy().value;
        const EMPTY: number = Player.NONE.value;

        let moves: EpaminondasMove[] = [];
        const slice: EpaminondasPartSlice = node.gamePartSlice;
        let move: EpaminondasMove;
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                const firstCoord: Coord = new Coord(x, y);
                if (slice.getBoardAt(firstCoord) === PLAYER) {
                    for (const direction of Direction.DIRECTIONS) {
                        let movedPieces: number = 1;
                        let nextCoord: Coord = firstCoord.getNext(direction, 1);
                        while (nextCoord.isInRange(14, 12) &&
                            slice.getBoardAt(nextCoord) === PLAYER) {
                            movedPieces += 1;
                            nextCoord = nextCoord.getNext(direction, 1);
                        }
                        let stepSize: number = 1;
                        while (nextCoord.isInRange(14, 12) &&
                            stepSize <= movedPieces &&
                            slice.getBoardAt(nextCoord) === EMPTY) {
                            move = new EpaminondasMove(x, y, movedPieces, stepSize, direction);
                            moves = this.addMove(moves, move, slice);

                            stepSize++;
                            nextCoord = nextCoord.getNext(direction, 1);
                        }
                        if (nextCoord.isInRange(14, 12) &&
                            stepSize <= movedPieces &&
                            slice.getBoardAt(nextCoord) === ENNEMY) {
                            move = new EpaminondasMove(x, y, movedPieces, stepSize, direction);
                            moves = this.addMove(moves, move, slice);
                        }
                    }
                }
            }
        }
        ArrayUtils.sortByDescending(moves, (move: EpaminondasMove): number => {
            return move.stepSize; // Best for normal, might not be best for others!
        });
        return moves;
    }
    public addMove(moves: EpaminondasMove[],
                   move: EpaminondasMove,
                   slice: EpaminondasPartSlice)
    : EpaminondasMove[]
    {
        const legality: EpaminondasLegalityStatus = EpaminondasRules.isLegal(move, slice);
        if (legality.legal.isSuccess()) {
            moves.push(move);
        }
        return moves;
    }
    public getBoardValue(node: EpaminondasNode): NodeUnheritance {
        const slice: EpaminondasPartSlice = node.gamePartSlice;
        const zerosInFirstLine: number = slice.count(Player.ZERO, 0);
        const onesInLastLine: number = slice.count(Player.ONE, 11);
        if (slice.turn % 2 === 0) {
            if (zerosInFirstLine > onesInLastLine) {
                return new NodeUnheritance(Number.MIN_SAFE_INTEGER);
            }
        } else {
            if (onesInLastLine > zerosInFirstLine) {
                return new NodeUnheritance(Number.MAX_SAFE_INTEGER);
            }
        }
        return new NodeUnheritance(this.getPieceCountPlusRowDomination(slice));
    }
    public getPieceCountPlusRowDomination(state: EpaminondasPartSlice): number {
        const SCORE_BY_PIECE: number = 14*13*11;
        const SCORE_BY_ROW_DOMINATION: number = 2;
        const SCORE_BY_PRESENCE: number = 1;
        const SCORE_BY_ALIGNEMENT: number = 1;
        let total: number = 0;
        for (let y: number = 0; y < 12; y++) {
            let row: number = 0;
            const wasPresent: number[] = [0, 0];
            for (let x: number = 0; x < 14; x++) {
                const coord: Coord = new Coord(x, y);
                const player: Player = Player.of(state.getBoardAt(coord));
                if (player !== Player.NONE) {
                    const mod: number = player.getScoreModifier();
                    total += SCORE_BY_PIECE * mod;
                    wasPresent[player.value] = mod;
                    row += mod;
                    for (const dir of [Direction.UP_LEFT, Direction.UP, Direction.UP_RIGHT]) {
                        let neighboor: Coord = coord.getNext(dir, 1);
                        while (neighboor.isInRange(14, 12) &&
                               state.getBoardAt(neighboor) === player.value)
                        {
                            total += mod * SCORE_BY_ALIGNEMENT;
                            neighboor = neighboor.getNext(dir, 1);
                        }
                    }
                }
            }
            if (row !== 0) {
                total += (Math.abs(row) / row) * SCORE_BY_ROW_DOMINATION;
            }
            total += wasPresent.reduce((sum: number, newElement: number) => sum + newElement) * SCORE_BY_PRESENCE;
        }
        return total;
    }
}
