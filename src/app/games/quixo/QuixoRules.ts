import { Coord } from 'src/app/jscaip/Coord';
import { Orthogonal } from 'src/app/jscaip/Direction';
import { GameNode } from 'src/app/jscaip/GameNode';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { Rules } from 'src/app/jscaip/Rules';
import { QuixoConfig, QuixoState } from './QuixoState';
import { QuixoMove } from './QuixoMove';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { NInARowHelper } from 'src/app/jscaip/NInARowHelper';
import { Utils } from 'src/app/utils/utils';
import { MGPSet } from 'src/app/utils/MGPSet';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { QuixoFailure } from './QuixoFailure';

export class QuixoNode extends GameNode<QuixoMove, QuixoState> {}

export class QuixoRules extends Rules<QuixoMove, QuixoState> {

    private static singleton: MGPOptional<QuixoRules> = MGPOptional.empty();

    public static readonly DEFAULT_CONFIG: QuixoConfig = {
        width: 5,
        height: 5,
    };

    public static get(): QuixoRules {
        if (QuixoRules.singleton.isAbsent()) {
            QuixoRules.singleton = MGPOptional.of(new QuixoRules());
        }
        return QuixoRules.singleton.get();
    }

    private constructor() {
        super(QuixoState, QuixoRules.DEFAULT_CONFIG);
    }

    public static readonly QUIXO_HELPER: NInARowHelper<PlayerOrNone> =
        new NInARowHelper(Utils.identity, 5); // TODO, not 5, Sorry CT-5555, fallen hero of the Clones

    public static getVerticalCoords(node: QuixoNode): Coord[] {
        const currentOpponent: Player = node.gameState.getCurrentOpponent();
        const verticalCoords: Coord[] = [];
        const state: QuixoState = node.gameState;
        for (let y: number = 0; y < state.getHeight(); y++) {
            if (state.getPieceAtXY(0, y) !== currentOpponent) {
                verticalCoords.push(new Coord(0, y));
            }
            if (state.getPieceAtXY(state.getWidth() - 1, y) !== currentOpponent) {
                verticalCoords.push(new Coord(state.getWidth() - 1, y));
            }
        }
        return verticalCoords;
    }

    public static getHorizontalCenterCoords(node: QuixoNode): Coord[] {
        const currentOpponent: Player = node.gameState.getCurrentOpponent();
        const horizontalCenterCoords: Coord[] = [];
        const state: QuixoState = node.gameState;
        for (let x: number = 1; x < state.getWidth() - 1; x++) {
            if (state.getPieceAtXY(x, 0) !== currentOpponent) {
                horizontalCenterCoords.push(new Coord(x, 0));
            }
            if (state.getPieceAtXY(x, state.getHeight() - 1) !== currentOpponent) {
                horizontalCenterCoords.push(new Coord(x, state.getHeight() - 1));
            }
        }
        return horizontalCenterCoords;
    }

    public getPossibleDirections(state: QuixoState, coord: Coord): Orthogonal[] {
        const possibleDirections: Orthogonal[] = [];
        if (coord.x !== 0) possibleDirections.push(Orthogonal.LEFT);
        if (coord.y !== 0) possibleDirections.push(Orthogonal.UP);
        if (coord.x !== (state.getWidth() - 1)) possibleDirections.push(Orthogonal.RIGHT);
        if (coord.y !== (state.getHeight() - 1)) possibleDirections.push(Orthogonal.DOWN);
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
        for (const coordAndContent of state.getCoordsAndContents()) {
            const content: PlayerOrNone = coordAndContent.content;
            const x: number = coordAndContent.coord.x;
            const y: number = coordAndContent.coord.y;
            if (content.isPlayer()) {
                const c: number = content.value;
                sums[c].columns[x] = sums[c].columns[x] + 1;
                sums[c].rows[y] = sums[c].rows[y] + 1;
                if (x === y) sums[c].diagonals[0] = sums[c].diagonals[0] + 1;
                if (x + y === (state.getWidth() - 1)) sums[c].diagonals[1] = sums[c].diagonals[1] + 1;
                // TODO: check that diagonal are still correctly identified in rectangular board
            }
        }
        return sums;
    }

    public static getVictoriousCoords(state: QuixoState): Coord[] {
        return QuixoRules.QUIXO_HELPER.getVictoriousCoord(state);
    }

    public static getFullestLine(playersLinesInfo: {[lineType: string]: number[]}): number {
        const linesScores: number[] = playersLinesInfo.columns.concat(
            playersLinesInfo.rows.concat(
                playersLinesInfo.diagonals));
        return Math.max(...linesScores);
    }

    public isValidCoord(state: QuixoState, coord: Coord): MGPValidation {
        Utils.assert(state.isOnBoard(coord),
                     'Invalid coord for QuixoMove: ' + coord.toString() + ' is outside the board.');
        if (coord.x !== 0 &&
            coord.x !== (state.getWidth() - 1) &&
            coord.y !== 0 &&
            coord.y !== (state.getHeight() - 1))
        {
            return MGPValidation.failure(QuixoFailure.NO_INSIDE_CLICK());
        }
        return MGPValidation.SUCCESS;
    }

    private assertDirectionValidity(move: QuixoMove, state: QuixoState): void {
        const x: number = move.coord.x;
        const y: number = move.coord.y;
        const direction: Orthogonal = move.direction;
        Utils.assert(x !== (state.getWidth() - 1) || direction !== Orthogonal.RIGHT,
                     `Invalid direction: pawn on the right side can't be moved to the right.`);
        Utils.assert(y !== (state.getHeight() - 1) || direction !== Orthogonal.DOWN,
                     `Invalid direction: pawn on the bottom side can't be moved down.`);
        Utils.assert(x !== 0 || direction !== Orthogonal.LEFT,
                     `Invalid direction: pawn on the left side can't be moved to the left.`);
        Utils.assert(y !== 0 || direction !== Orthogonal.UP,
                     `Invalid direction: pawn on the top side can't be moved up.`);
    }

    public applyLegalMove(move: QuixoMove, state: QuixoState, _info: void): QuixoState {
        return state.applyLegalMove(move);
    }

    public isLegal(move: QuixoMove, state: QuixoState): MGPValidation {
        const coordValidity: MGPValidation = this.isValidCoord(state, move.coord);
        if (coordValidity.isFailure()) {
            return coordValidity;
        }
        this.assertDirectionValidity(move, state);
        if (state.getPieceAt(move.coord) === state.getCurrentOpponent()) {
            return MGPValidation.failure(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        } else {
            return MGPValidation.SUCCESS;
        }
    }

    public getGameStatus(node: QuixoNode): GameStatus {
        const state: QuixoState = node.gameState;
        const victoriousCoord: Coord[] = QuixoRules.QUIXO_HELPER.getVictoriousCoord(state);
        const unreducedWinners: PlayerOrNone[] = victoriousCoord.map((coord: Coord) => state.getPieceAt(coord));
        const winners: MGPSet<PlayerOrNone> = new MGPSet(unreducedWinners);
        if (winners.size() === 0) {
            return GameStatus.ONGOING;
        } else if (winners.size() === 1) {
            return GameStatus.getVictory(winners.getAnyElement().get() as Player);
        } else {
            return GameStatus.getVictory(state.getCurrentPlayer());
        }
    }

}
