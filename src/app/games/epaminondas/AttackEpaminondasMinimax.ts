import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { EpaminondasMinimax } from './EpaminondasMinimax';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasPartSlice } from './EpaminondasPartSlice';

export class AttackEpaminondasMinimax extends EpaminondasMinimax {
    public readonly rowWeights: number[] = [100, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 100];
    public readonly cellWeights: number[][] = [
        [0, 5, 10, 15, 20, 25, 30, 30, 25, 20, 15, 10, 5, 0],
        [0, 5, 10, 15, 20, 25, 30, 30, 25, 20, 15, 10, 5, 0],
        [0, 5, 10, 15, 20, 25, 30, 30, 25, 20, 15, 10, 5, 0],
        [0, 5, 10, 15, 20, 25, 30, 30, 25, 20, 15, 10, 5, 0],
        [0, 5, 10, 15, 20, 25, 30, 30, 25, 20, 15, 10, 5, 0],
        [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
        [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
        [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
        [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
        [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
        [35, 30, 25, 20, 15, 10, 0, 0, 10, 15, 20, 25, 30, 35],
        [35, 30, 25, 20, 15, 10, 0, 0, 10, 15, 20, 25, 30, 35],
    ];
    public weight(player: Player, x: number, y: number): number {
        const yIndex: number = (player === Player.ZERO) ? y : (11 - y);
        // Prioritize low y with middle x
        // Prioritize high y with low/high x
        return this.rowWeights[yIndex]; // * 5 + this.cellWeights[yIndex][x];
    }
    public biggestForwardPhalanxLength(slice: EpaminondasPartSlice, x: number, y: number): number {
        const coord: Coord = new Coord(x, y);
        const player: number = slice.getBoardAt(coord);
        let lengthUp: number = 0;
        let lengthDown: number = 0;
        const directions: Direction[] = [Direction.UP];
        if (x > 8) {
            directions.push(Direction.UP_LEFT);
        }
        if (x < 6) {
            directions.push(Direction.UP_RIGHT);
        }
        for (const direction of directions) {
            let inPhalanxUp: boolean = true;
            let inPhalanxDown: boolean = true;
            for (let i: number = 1; i < 14; i++) {
                if (inPhalanxUp) {
                    const coord2: Coord = coord.getNext(direction, i);
                    if (coord2.isInRange(14, 12) && slice.getBoardAt(coord2) === player) {
                        lengthUp += 1;
                    } else {
                        inPhalanxUp = false;
                    }
                }
                if (inPhalanxDown) {
                    const coord2: Coord = coord.getNext(direction.getOpposite(), i);
                    if (coord2.isInRange(14, 12) && slice.getBoardAt(coord2) === player) {
                        lengthDown += 1;
                    } else {
                        inPhalanxDown = false;
                    }
                }
            }
        }
        return lengthUp + lengthDown + 1;
    }
    public biggestHorizontalPhalanx(slice: EpaminondasPartSlice, player: Player, row: number): number {
        let phalanxLength: number = 0;
        let maxPhalanxLength: number = 0;
        let inPhalanx: boolean = false;
        for (let x: number = 0; x < 14; x++) {
            if (slice.getBoardByXY(x, row) === player.value) {
                if (inPhalanx === false) {
                    inPhalanx = true;
                    phalanxLength = 1;
                } else {
                    phalanxLength += 1;
                }
            } else {
                inPhalanx = false;
                if (phalanxLength > maxPhalanxLength) {
                    maxPhalanxLength = phalanxLength;
                }
            }
        }
        return maxPhalanxLength;
    }
    public getBoardValue(move: EpaminondasMove, slice: EpaminondasPartSlice): NodeUnheritance {
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
        let score0: number = 0;
        let score1: number = 0;
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                if (slice.getBoardByXY(x, y) === Player.ZERO.value) {
                    if (y === 12) {
                        score0 += this.biggestHorizontalPhalanx(slice, Player.ZERO, 12);
                    }
                    score0 += 20 * this.biggestForwardPhalanxLength(slice, x, y);
                    score0 += this.weight(Player.ZERO, x, y);
                } else if (slice.getBoardByXY(x, y) === Player.ONE.value) {
                    if (y === 0) {
                        score1 += this.biggestHorizontalPhalanx(slice, Player.ONE, 0);
                    }
                    score1 += 20 * this.biggestForwardPhalanxLength(slice, x, y);
                    score1 += this.weight(Player.ONE, x, y);
                }
            }
        }
        return new NodeUnheritance((5 * move.movedPieces) *
            (score0 * Player.ZERO.getScoreModifier() +
                score1 * Player.ONE.getScoreModifier()));

    }
}
