import { Coord } from 'src/app/jscaip/Coord';
import { Direction } from 'src/app/jscaip/Direction';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { Player } from 'src/app/jscaip/Player';
import { EpaminondasMinimax } from './EpaminondasMinimax';
import { EpaminondasMove } from './EpaminondasMove';
import { EpaminondasPartSlice } from './EpaminondasPartSlice';

export class AttackEpaminondasMinimax extends EpaminondasMinimax {
    private readonly DOMINANCE_FACTOR: number = 20;
    private readonly DEFENSE_FACTOR: number = 5;
    private readonly TERRITORY_FACTOR: number = 2;
    private readonly OFFENSE_FACTOR: number = 10;
    private readonly CENTER_FACTOR: number = 5;
    private readonly MOBILITY_FACTOR: number = 0.12;
    public getDominance(slice: EpaminondasPartSlice): number {
        let score: number = 0;
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                const owner: Player = Player.of(slice.getBoardAt(new Coord(x, y)));
                if (owner !== Player.NONE) {
                    score += owner.getScoreModifier();
                }
            }
        }
        return score * this.DOMINANCE_FACTOR;
    }
    public getDefense(slice: EpaminondasPartSlice): number {
        let score: number = 0;
        for (let x: number = 0; x < 14; x++) {
            if (slice.getBoardAt(new Coord(x, 11)) === Player.ZERO.value) {
                score += Player.ZERO.getScoreModifier();
            }
            if (slice.getBoardAt(new Coord(x, 0)) === Player.ONE.value) {
                score += Player.ONE.getScoreModifier();
            }
        }
        return score * this.DEFENSE_FACTOR;
    }
    public getTerritory(slice: EpaminondasPartSlice): number {
        let score: number = 0;
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                const owner: Player = Player.of(slice.getBoardAt(new Coord(x, y)));
                if (owner !== Player.NONE) {
                    for (let dx: number = -1; dx <= 1; dx++) {
                        for (let dy: number = -1; dy <= 1; dy++) {
                            const coord: Coord = new Coord(x+dx, y+dy);
                            if (coord.isInRange(14, 12)) {
                                const neighbour: number = slice.getBoardAt(coord);
                                if (neighbour === owner.value) {
                                    score += 1 * owner.getScoreModifier();
                                } else if (neighbour === Player.NONE.value) {
                                    score += 1 * owner.getScoreModifier();
                                }
                            }
                        }
                    }
                    score -= owner.getScoreModifier();
                }
            }
        }
        return score * this.TERRITORY_FACTOR;
    }
    public getOffense(slice: EpaminondasPartSlice): number {
        let score: number = 0;
        for (let x: number = 0; x < 14; x++) {
            if (slice.getBoardAt(new Coord(x, 0)) === Player.ZERO.value) {
                score += Player.ZERO.getScoreModifier();
            }
            if (slice.getBoardAt(new Coord(x, 11)) === Player.ONE.value) {
                score += Player.ONE.getScoreModifier();
            }
        }
        return score * this.OFFENSE_FACTOR;
    }
    public getCenter(slice: EpaminondasPartSlice): number {
        let score: number = 0;
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                const owner: Player = Player.of(slice.getBoardAt(new Coord(x, y)));
                if (owner !== Player.NONE) {
                    score += owner.getScoreModifier()*(Math.sqrt((x - 6.5)*(x - 6.5)));
                }
            }
        }
        return score * this.CENTER_FACTOR;
    }
    public getMobility(slice: EpaminondasPartSlice): number {
        let score: number = 0;
        let biggestZero: number = 0;
        let biggestOne: number = 0;
        for (let y: number = 0; y < 12; y++) {
            for (let x: number = 0; x < 14; x++) {
                const firstCoord: Coord = new Coord(x, y);
                const owner: Player = Player.of(slice.getBoardAt(firstCoord));
                if (owner !== Player.NONE) {
                    for (const direction of Direction.DIRECTIONS) {
                        let movedPieces: number = 1;
                        let nextCoord: Coord = firstCoord.getNext(direction, 1);
                        while (nextCoord.isInRange(14, 12) &&
                            slice.getBoardAt(nextCoord) === owner.value) {
                            movedPieces += 1;
                            nextCoord = nextCoord.getNext(direction, 1);
                        }
                        let stepSize: number = 1;
                        while (nextCoord.isInRange(14, 12) &&
                            stepSize <= movedPieces &&
                            slice.getBoardAt(nextCoord) === Player.NONE.value) {
                            stepSize++;
                            nextCoord = nextCoord.getNext(direction, 1);
                        }
                        score += (stepSize*stepSize) * owner.getScoreModifier();
                        if (owner === Player.ZERO) {
                            biggestZero = Math.max(biggestZero, stepSize);
                        } else if (owner === Player.ONE) {
                            biggestOne = Math.max(biggestOne, stepSize);
                        }
                    }
                }
            }
        }
        return (score +
            biggestZero * Player.ZERO.getScoreModifier() +
            biggestOne * Player.ONE.getScoreModifier()) * this.MOBILITY_FACTOR;
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
        const dominance: number = this.getDominance(slice);
        const defense: number = this.getDefense(slice);
        const territory: number = this.getTerritory(slice);
        const center: number = this.getCenter(slice);
        const winning: number = this.getOffense(slice);
        const mobility: number = this.getMobility(slice);
        return new NodeUnheritance(dominance + defense + territory + center + winning + mobility);
    }
}
