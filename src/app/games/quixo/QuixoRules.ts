import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { QuixoPartSlice } from './QuixoPartSlice';
import { QuixoMove } from './QuixoMove';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';

export abstract class QuixoNode extends MGPNode<QuixoRules, QuixoMove, QuixoPartSlice> {}

export class QuixoRules extends Rules<QuixoMove, QuixoPartSlice> {

    public static getVerticalCoords(node: QuixoNode): Coord[] {
        const currentEnnemy: number = node.gamePartSlice.getCurrentEnnemy().value;
        const verticalCoords: Coord[] = [];
        for (let y: number = 0; y < 5; y++) {
            if (node.gamePartSlice.getBoardByXY(0, y) !== currentEnnemy) {
                verticalCoords.push(new Coord(0, y));
            }
            if (node.gamePartSlice.getBoardByXY(4, y) !== currentEnnemy) {
                verticalCoords.push(new Coord(4, y));
            }
        }
        return verticalCoords;
    }
    public static getHorizontalCenterCoords(node: QuixoNode): Coord[] {
        const currentEnnemy: number = node.gamePartSlice.getCurrentEnnemy().value;
        const horizontalCenterCoords: Coord[] = [];
        for (let x: number = 1; x < 4; x++) {
            if (node.gamePartSlice.getBoardByXY(x, 0) !== currentEnnemy) {
                horizontalCenterCoords.push(new Coord(x, 0));
            }
            if (node.gamePartSlice.getBoardByXY(x, 4) !== currentEnnemy) {
                horizontalCenterCoords.push(new Coord(x, 4));
            }
        }
        return horizontalCenterCoords;
    }
    public static getPossibleDirections(coord: Coord): Orthogonal[] {
        const possibleDirections: Orthogonal[] = [];
        if (coord.x !== 0) possibleDirections.push(Orthogonal.LEFT);
        if (coord.y !== 0) possibleDirections.push(Orthogonal.UP);
        if (coord.x !== 4) possibleDirections.push(Orthogonal.RIGHT);
        if (coord.y !== 4) possibleDirections.push(Orthogonal.DOWN);
        return possibleDirections;
    }
    public static getLinesSums(slice: QuixoPartSlice): {[player: number]: {[lineType: string]: number[]}} {
        const sums: {[player: number]: {[lineType: string]: number[]}} = {};
        sums[Player.ZERO.value] = {
            columns: [0, 0, 0, 0, 0],
            rows: [0, 0, 0, 0, 0],
            diagonals: [0, 0],
        };
        sums[Player.ONE.value] = {
            columns: [0, 0, 0, 0, 0],
            rows: [0, 0, 0, 0, 0],
            diagonals: [0, 0],
        };
        for (let y: number = 0; y < 5; y++) {
            for (let x: number = 0; x < 5; x++) {
                const c: number = slice.getBoardByXY(x, y);
                if (c !== Player.NONE.value) {
                    sums[c].columns[x] = sums[c].columns[x] + 1;
                    sums[c].rows[y] = sums[c].rows[y] + 1;
                    if (x === y) sums[c].diagonals[0] = sums[c].diagonals[0] + 1;
                    if (x + y === 4) sums[c].diagonals[1] = sums[c].diagonals[1] + 1;
                }
            }
        }
        return sums;
    }
    public static getVictoriousCoords(slice: QuixoPartSlice): Coord[] {
        const lineSums: {[player: number]: {[lineType: string]: number[]}} = QuixoRules.getLinesSums(slice);
        const coords: Coord[] = [];
        for (let player: number = 0; player < 2; player++) {
            for (let i: number = 0; i < 5; i++) {
                if (lineSums[player].columns[i] === 5) {
                    for (let j: number = 0; j < 5; j++) {
                        coords.push(new Coord(i, j));
                    }
                }
                if (lineSums[player].rows[i] === 5) {
                    for (let j: number = 0; j < 5; j++) {
                        coords.push(new Coord(j, i));
                    }
                }
            }
            if (lineSums[player].diagonals[0] === 5) {
                for (let i: number = 0; i < 5; i++) {
                    coords.push(new Coord(i, i));
                }
            }
            if (lineSums[player].diagonals[1] === 5) {
                for (let i: number = 0; i < 5; i++) {
                    coords.push(new Coord(i, 4-i));
                }
            }
        }
        return coords;
    }
    public static getFullestLine(playersLinesInfo: {[lineType: string]: number[]}): number {
        const linesScores: number[] = playersLinesInfo.columns.concat(
            playersLinesInfo.rows.concat(
                playersLinesInfo.diagonals));
        return Math.max(...linesScores);
    }
    public applyLegalMove(move: QuixoMove,
                          slice: QuixoPartSlice,
                          status: LegalityStatus): QuixoPartSlice
    {
        return QuixoRules.applyLegalMove(move, slice, status);
    }
    public static applyLegalMove(move: QuixoMove,
                                 slice: QuixoPartSlice,
                                 _status: LegalityStatus)
    : QuixoPartSlice
    {
        return slice.applyLegalMove(move);
    }
    public isLegal(move: QuixoMove, slice: QuixoPartSlice): LegalityStatus {
        if (slice.getBoardAt(move.coord) === slice.getCurrentEnnemy().value) {
            return { legal: MGPValidation.failure(RulesFailure.CANNOT_CHOOSE_ENEMY_PIECE()) };
        } else {
            return { legal: MGPValidation.SUCCESS };
        }
    }
    public getGameStatus(node: QuixoNode): GameStatus {
        const state: QuixoPartSlice = node.gamePartSlice;
        const linesSums: {[key: string]: {[key: number]: number[]}} =
            QuixoRules.getLinesSums(state);
        const zerosFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ZERO.value]);
        const onesFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ONE.value]);
        const currentPlayer: Player = state.getCurrentPlayer();
        if (zerosFullestLine === 5) {
            if (currentPlayer === Player.ZERO || onesFullestLine < 5) {
                return GameStatus.ZERO_WON;
            }
        }
        if (onesFullestLine === 5) {
            return GameStatus.ONE_WON;
        }
        return GameStatus.ONGOING;
    }
}
