import {MGPMap} from 'src/app/collectionlib/mgpmap/MGPMap';
import {MGPValidation} from 'src/app/collectionlib/mgpvalidation/MGPValidation';
import {Coord} from 'src/app/jscaip/coord/Coord';
import {Orthogonal} from 'src/app/jscaip/DIRECTION';
import {LegalityStatus} from 'src/app/jscaip/LegalityStatus';
import {MGPNode} from 'src/app/jscaip/mgpnode/MGPNode';
import {Player} from 'src/app/jscaip/Player';
import {Rules} from 'src/app/jscaip/Rules';
import {QuixoPartSlice} from '../quixo-part-slice/QuixoPartSlice';
import {QuixoMove} from '../QuixoMove';

export abstract class QuixoNode extends MGPNode<Rules<QuixoMove, QuixoPartSlice, LegalityStatus>, QuixoMove, QuixoPartSlice, LegalityStatus> {}

export class QuixoRules extends Rules<QuixoMove, QuixoPartSlice, LegalityStatus> {
    public getListMoves(node: QuixoNode): MGPMap<QuixoMove, QuixoPartSlice> {
        const slice: QuixoPartSlice = node.gamePartSlice;
        const moves: MGPMap<QuixoMove, QuixoPartSlice> = new MGPMap<QuixoMove, QuixoPartSlice>();
        const verticalCoords: Coord[] = QuixoRules.getVerticalCoords(node);
        const horizontalCenterCoords: Coord[] = QuixoRules.getHorizontalCenterCoords(node);
        const coords: Coord[] = horizontalCenterCoords.concat(verticalCoords);
        for (const coord of coords) {
            const possibleDirections: Orthogonal[] = QuixoRules.getPossibleDirections(coord);
            for (const possibleDirection of possibleDirections) {
                const newMove: QuixoMove = new QuixoMove(coord.x, coord.y, possibleDirection);
                const resultingSlice: QuixoPartSlice = QuixoRules.applyLegalMove(newMove, slice, null).resultingSlice;
                moves.put(newMove, resultingSlice);
            }
        }
        return moves;
    }
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
    public getBoardValue(move: QuixoMove, slice: QuixoPartSlice): number {
        const linesSums: {[key: string]: {[key: number]: number[]}} =
            QuixoRules.getLinesSums(slice);
        const zerosFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ZERO.value]);
        const onesFullestLine: number = QuixoRules.getFullestLine(linesSums[Player.ONE.value]);
        const currentPlayer: Player = slice.getCurrentPlayer();
        if (zerosFullestLine === 5) {
            if (currentPlayer === Player.ZERO || onesFullestLine < 5) {
                return Number.MIN_SAFE_INTEGER;
            }
        }
        if (onesFullestLine === 5) {
            return Number.MAX_SAFE_INTEGER;
        }
        return onesFullestLine - zerosFullestLine;
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
                if (c != Player.NONE.value) {
                    sums[c].columns[x] = sums[c].columns[x] + 1;
                    sums[c].rows[y] = sums[c].rows[y] + 1;
                    if (x === y) sums[c].diagonals[0] = sums[c].diagonals[0] + 1;
                    if (x + y === 4) sums[c].diagonals[1] = sums[c].diagonals[1] + 1;
                }
            }
        }
        return sums;
    }
    public static getFullestLine(playersLinesInfo: {[lineType: string]: number[]}): number {
        const linesScores: number[] = playersLinesInfo.columns.concat(
            playersLinesInfo.rows.concat(
                playersLinesInfo.diagonals));
        return Math.max(...linesScores);
    }
    public applyLegalMove(move: QuixoMove, slice: QuixoPartSlice, status: LegalityStatus): { resultingMove: QuixoMove; resultingSlice: QuixoPartSlice; } {
        return QuixoRules.applyLegalMove(move, slice, status);
    }
    public static applyLegalMove(move: QuixoMove, slice: QuixoPartSlice, status: LegalityStatus): { resultingMove: QuixoMove; resultingSlice: QuixoPartSlice; } {
        return {resultingMove: move,
            resultingSlice: slice.applyLegalMove(move),
        };
    }
    public isLegal(move: QuixoMove, slice: QuixoPartSlice): LegalityStatus {
        if (slice.getBoardAt(move.coord) === slice.getCurrentEnnemy().value) return {legal: MGPValidation.failure('piece owned by ennemy player')};
        else return {legal: MGPValidation.SUCCESS};
    }
}
