import { Direction } from '../../jscaip/Direction';
import { Coord } from '../../jscaip/Coord';
import { GameStatus, Rules } from '../../jscaip/Rules';
import { SCORE } from '../../jscaip/SCORE';
import { MGPNode } from '../../jscaip/MGPNode';

import { P4PartSlice } from './P4PartSlice';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';
import { assert, display } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { P4Move } from './P4Move';
import { NumberTable } from 'src/app/utils/ArrayUtils';
import { NodeUnheritance } from 'src/app/jscaip/NodeUnheritance';
import { P4Failure } from './P4Failure';

export abstract class P4Node extends MGPNode<P4Rules, P4Move, P4PartSlice> {}

export class P4Rules extends Rules<P4Move, P4PartSlice> {
    public static VERBOSE: boolean = false;

    public static getVictoriousCoords(slice: P4PartSlice): Coord[] {
        const coords: Coord[] = [];
        for (let x: number = 0; x < 7; x++) {
            for (let y: number = 5; y !== -1 && slice.board[y][x] !== Player.NONE.value; y--) {
                const caseScore: number = P4Rules.getCaseScore(slice.board, new Coord(x, y));
                if (caseScore === Player.ZERO.getVictoryValue() ||
                    caseScore === Player.ONE.getVictoryValue())
                {
                    coords.push(new Coord(x, y));
                }
            }
        }
        return coords;
    }
    private static getBoardValueFromScratch(slice: P4PartSlice): NodeUnheritance {
        display(P4Rules.VERBOSE, { P4Rules_getBoardValueFromScratch: { slice } });
        let score: number = 0;

        for (let x: number = 0; x < 7; x++) {
            // for every column, starting from the bottom of each column
            for (let y: number = 5; y !== -1 && slice.board[y][x] !== Player.NONE.value; y--) {
                // while we haven't reached the top or an empty case
                const tmpScore: number = P4Rules.getCaseScore(slice.board, new Coord(x, y));
                if (MGPNode.getScoreStatus(tmpScore) !== SCORE.DEFAULT) {
                    // if we find a pre-victory
                    display(P4Rules.VERBOSE, { preVictoryOrVictory: { slice, tmpScore, coord: { x, y } } });
                    return new NodeUnheritance(tmpScore); // we return it
                    // TODO vérifier que PRE_VICTORY n'écrase pas les VICTORY dans ce cas ci
                    // Il semble tout à fait possible d'avoir une pré-victoire sur une colonne,
                    // et une victoire sur la suivante
                }
                score += tmpScore;
            }
        }
        return new NodeUnheritance(score);
    }
    public static getLowestUnoccupiedCase(board: NumberTable, x: number): number {
        let y: number = 0;
        while (y < 6 && board[y][x] === Player.NONE.value) {
            y++;
        }
        return y - 1;
    }
    public static getNumberOfFreeSpacesAndAllies(board: NumberTable,
                                                 i: Coord,
                                                 dir: Direction,
                                                 ennemy: number,
                                                 ally: number): [number, number] {
        /*
       * pour une case i(iX, iY) contenant un pion 'allie' (dont les ennemis sont naturellement 'ennemi'
       * on parcours le plateau à partir de i dans la direction d(dX, dY)
       * et ce à une distance maximum de 3 cases
       */

        let freeSpaces: number = 0; // le nombre de case libres alignées
        let allies: number = 0; // le nombre de case alliées alignées
        let allAlliesAreSideBySide: boolean = true;
        let coord: Coord = new Coord(i.x + dir.x, i.y + dir.y);
        while (coord.isInRange(7, 6) && freeSpaces !== 3) {
            // tant qu'on ne sort pas du plateau
            const currentCase: number = board[coord.y][coord.x];
            if (currentCase === ennemy) {
                return [freeSpaces, allies];
            }
            if (currentCase === ally && allAlliesAreSideBySide) {
                allies++;
            } else {
                allAlliesAreSideBySide = false; // on arrête de compter les alliées sur cette ligne
            }
            // dès que l'un d'entre eux n'est plus collé
            if (currentCase !== ennemy && currentCase !== ally) {
                // TODO: this condition was not there before, check that it makes sense (but the body was there)
                freeSpaces++;
            }
            // co = new Coord(co.x + dir.x, co.y + dir.y);
            coord = coord.getNext(dir);
        }
        return [freeSpaces, allies];
    }
    private static getEnnemy(board: NumberTable, coord: Coord): number {
        const c: number = board[coord.y][coord.x];
        assert(c !== Player.NONE.value, 'getEnnemy should not be called with Player.NONE');
        return (c === Player.ONE.value) ? Player.ZERO.value : Player.ONE.value;
    }
    public static getCaseScore(board: NumberTable, c: Coord): number {
        display(P4Rules.VERBOSE, 'getCaseScore(board, ' + c.x + ', ' + c.y + ') appellée');
        display(P4Rules.VERBOSE, board);
        assert(board[c.y][c.x] !== Player.NONE.value, 'getCaseScore should not be called on an empty case');

        let score: number = 0; // final result, count the theoretical victorys possibility

        const ennemy: number = P4Rules.getEnnemy(board, c);
        const ally: number = board[c.y][c.x];

        const distByDirs: Map<Direction, number> = new Map();
        const alliesByDirs: Map<Direction, number> = new Map();

        for (const dir of Direction.DIRECTIONS) {
            const tmpData: [number, number] = P4Rules.getNumberOfFreeSpacesAndAllies(board, c, dir, ennemy, ally);
            distByDirs.set(dir, tmpData[0]);
            alliesByDirs.set(dir, tmpData[1]);
        }

        for (const dir of [Direction.UP, Direction.UP_RIGHT, Direction.RIGHT, Direction.DOWN_RIGHT]) {
            // for each pair of opposite directions
            const lineAllies: number = alliesByDirs.get(dir) + alliesByDirs.get(dir.getOpposite());
            if (lineAllies > 2) {
                display(P4Rules.VERBOSE, { text:
                    'there is some kind of victory here (' + c.x + ', ' + c.y + ')' + '\n' +
                    'line allies : ' + lineAllies + '\n',
                board,
                });
                return Player.of(ally).getVictoryValue();
            }

            const lineDist: number = distByDirs.get(dir) + distByDirs.get(dir.getOpposite());
            if (lineDist === 3) {
                score += 2;
            } else if (lineDist > 3) {
                score += lineDist - 2;
            }
        }
        return score * Player.of(ally).getScoreModifier();
    }
    public static getListMoves(node: P4Node): P4Move[] {
        display(P4Rules.VERBOSE, { context: 'P4Rules.getListMoves', node });

        // should be called only if the game is not over
        const originalPartSlice: P4PartSlice = node.gamePartSlice;
        const moves: P4Move[] = [];

        for (let x: number = 0; x < 7; x++) {
            if (originalPartSlice.getBoardByXY(x, 0) === Player.NONE.value) {
                const move: P4Move = P4Move.of(x);
                moves.push(move);
            }
        }
        return moves;
    }
    public static getBoardValue(slice: P4PartSlice): NodeUnheritance {
        display(P4Rules.VERBOSE, {
            text: 'P4Rules.getBoardValue called',
            board: slice.getCopiedBoard(),
        });
        return P4Rules.getBoardValueFromScratch(slice);
    }
    public applyLegalMove(move: P4Move,
                          slice: P4PartSlice,
                          status: LegalityStatus)
    : P4PartSlice
    {
        const x: number = move.x;
        const board: number[][] = slice.getCopiedBoard();
        const y: number = P4Rules.getLowestUnoccupiedCase(board, x);

        const turn: number = slice.turn;

        board[y][x] = slice.getCurrentPlayer().value;

        const resultingSlice: P4PartSlice = new P4PartSlice(board, turn+1);
        return resultingSlice;
    }
    public isLegal(move: P4Move, slice: P4PartSlice): LegalityStatus {
        display(P4Rules.VERBOSE, { context: 'P4Rules.isLegal', move: move.toString(), slice });
        if (slice.getBoardByXY(move.x, 0) !== Player.NONE.value) {
            return { legal: MGPValidation.failure(P4Failure.COLUMN_IS_FULL) };
        }
        return { legal: MGPValidation.SUCCESS };
    }
    public getGameStatus(node: P4Node): GameStatus {
        const state: P4PartSlice = node.gamePartSlice;
        for (let x: number = 0; x < 7; x++) {
            // for every column, starting from the bottom of each column
            for (let y: number = 5; y !== -1 && state.board[y][x] !== Player.NONE.value; y--) {
                // while we haven't reached the top or an empty case
                const tmpScore: number = P4Rules.getCaseScore(state.board, new Coord(x, y));
                if (MGPNode.getScoreStatus(tmpScore) === SCORE.VICTORY) {
                    return GameStatus.getVictory(state.getCurrentEnnemy());
                }
            }
        }
        return state.turn === 42 ? GameStatus.DRAW : GameStatus.ONGOING;
    }
}
