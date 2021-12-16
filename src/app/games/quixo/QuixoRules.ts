import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { Player } from 'src/app/jscaip/Player';
import { GameStatus, Rules } from 'src/app/jscaip/Rules';
import { QuixoState } from './QuixoState';
import { QuixoMove } from './QuixoMove';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPFallible } from 'src/app/utils/MGPFallible';

export class QuixoNode extends MGPNode<QuixoRules, QuixoMove, QuixoState> {}

export class QuixoRules extends Rules<QuixoMove, QuixoState> {

    public static getVerticalCoords(node: QuixoNode): Coord[] {
        const currentOpponent: Player = node.gameState.getCurrentOpponent();
        const verticalCoords: Coord[] = [];
        for (let y: number = 0; y < 5; y++) {
            if (node.gameState.getPieceAtXY(0, y) !== currentOpponent) {
                verticalCoords.push(new Coord(0, y));
            }
            if (node.gameState.getPieceAtXY(4, y) !== currentOpponent) {
                verticalCoords.push(new Coord(4, y));
            }
        }
        return verticalCoords;
    }
    public static getHorizontalCenterCoords(node: QuixoNode): Coord[] {
        const currentOpponent: Player = node.gameState.getCurrentOpponent();
        const horizontalCenterCoords: Coord[] = [];
        for (let x: number = 1; x < 4; x++) {
            if (node.gameState.getPieceAtXY(x, 0) !== currentOpponent) {
                horizontalCenterCoords.push(new Coord(x, 0));
            }
            if (node.gameState.getPieceAtXY(x, 4) !== currentOpponent) {
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
    public static getLinesSums(state: QuixoState): {[player: number]: {[lineType: string]: number[]}} {
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
                const c: number = state.getPieceAtXY(x, y).value;
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
    public static getVictoriousCoords(state: QuixoState): Coord[] {
        const lineSums: {[player: number]: {[lineType: string]: number[]}} = QuixoRules.getLinesSums(state);
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
                          state: QuixoState,
                          status: void): QuixoState
    {
        return QuixoRules.applyLegalMove(move, state, status);
    }
    public static applyLegalMove(move: QuixoMove,
                                 state: QuixoState,
                                 _status: void)
    : QuixoState
    {
        return state.applyLegalMove(move);
    }
    public isLegal(move: QuixoMove, state: QuixoState): MGPFallible<void> {
        if (state.getPieceAt(move.coord) === state.getCurrentOpponent()) {
            return MGPFallible.failure(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        } else {
            return MGPFallible.success(undefined);
        }
    }
    public getGameStatus(node: QuixoNode): GameStatus {
        const state: QuixoState = node.gameState;
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
