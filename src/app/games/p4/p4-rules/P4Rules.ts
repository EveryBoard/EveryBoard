import { Direction } from '../../../jscaip/Direction';
import { Coord } from '../../../jscaip/coord/Coord';
import { Rules } from '../../../jscaip/Rules';
import { SCORE } from '../../../jscaip/SCORE';
import { MGPNode } from '../../../jscaip/mgp-node/MGPNode';

import { P4PartSlice } from '../P4PartSlice';
import { MGPMap } from 'src/app/utils/mgp-map/MGPMap';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/player/Player';
import { assert, display } from 'src/app/utils/collection-lib/utils';
import { MGPValidation } from 'src/app/utils/mgp-validation/MGPValidation';
import { P4Move } from '../P4Move';
import { NumberTable } from 'src/app/utils/collection-lib/array-utils/ArrayUtils';

export abstract class P4Node extends MGPNode<P4Rules, P4Move, P4PartSlice, LegalityStatus> {}

export class P4Failure {
    public static COLUMN_IS_FULL: string = 'Veuillez placer votre pièce dans une colonne non remplie';
}

export class P4Rules extends Rules<P4Move, P4PartSlice, LegalityStatus> {
    public static VERBOSE: boolean = false;

    private static getBoardValueFromScratch(slice: P4PartSlice): number {
        display(P4Rules.VERBOSE, { P4Rules_getBoardValueFromScratch: { slice } });
        const currentBoard: number[][] = slice.getCopiedBoard();
        let score: number = 0;

        for (let x: number = 0; x < 7; x++) {
            // for every column, starting from the bottom of each column
            for (let y: number = 5; y !== -1 && currentBoard[y][x] !== Player.NONE.value; y--) {
                // while we haven't reached the top or an empty case
                const tmpScore: number = P4Rules.getCaseScore(currentBoard, new Coord(x, y));
                if (MGPNode.getScoreStatus(tmpScore) !== SCORE.DEFAULT) {
                    // if we find a pre-victory
                    display(P4Rules.VERBOSE, { preVictoryOrVictory: { slice, tmpScore, coord: { x, y } } });
                    return tmpScore; // we return it
                    // TODO vérifier que PRE_VICTORY n'écrase pas les VICTORY dans ce cas ci
                    // Il semble tout à fait possible d'avoir une pré-victoire sur une colonne, et une victoire sur la suivante
                }
                score += tmpScore;
            }
        }
        return score;
    }
    public static getLowestUnoccupiedCase(board: number[][], x: number): number {
        let y: number = 0;
        while (y < 5 && board[y + 1][x] === Player.NONE.value) {
            y++;
        }
        return y;
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
            const lineAllies: number = alliesByDirs.get(dir) + alliesByDirs.get(Direction.factory.oppositeOf(dir));
            if (lineAllies > 2) {
                display(P4Rules.VERBOSE, { text:
                    'there is some kind of victory here (' + c.x + ', ' + c.y + ')' + '\n' +
                    'line allies : ' + lineAllies + '\n',
                board,
                });
                return P4Rules.winForPlayer(ally);
            }

            const lineDist: number = distByDirs.get(dir) + distByDirs.get(Direction.factory.oppositeOf(dir));
            if (lineDist >= 3) {
                score += lineDist - 2;
            }
        }
        return score * Player.of(ally).getScoreModifier();
    }
    private static winForPlayer(player: number): number {
        if (player === Player.ZERO.value) {
            return Number.MIN_SAFE_INTEGER;
        } else {
            return Number.MAX_SAFE_INTEGER;
        }
    }
    public static getListMoves(node: P4Node): MGPMap<P4Move, P4PartSlice> {
        display(P4Rules.VERBOSE, { context: 'P4Rules.getListMoves', node });

        // should be called only if the game is not over
        const originalPartSlice: P4PartSlice = node.gamePartSlice;
        const originalBoard: number[][] = originalPartSlice.getCopiedBoard();
        const moves: MGPMap<P4Move, P4PartSlice> = new MGPMap<P4Move, P4PartSlice>();
        const turn: number = originalPartSlice.turn;

        for (let x: number = 0; x < 7; x++) {
            if (originalPartSlice.getBoardByXY(x, 0) === Player.NONE.value) {
                const y: number = P4Rules.getLowestUnoccupiedCase(originalBoard, x);

                const move: P4Move = P4Move.of(x);
                const newBoard: number[][] = originalPartSlice.getCopiedBoard();

                newBoard[y][x] = originalPartSlice.getCurrentPlayer().value;

                const newPartSlice: P4PartSlice = new P4PartSlice(newBoard, turn + 1);
                moves.set(move, newPartSlice);
            }
        }
        return moves;
    }
    public static getBoardValue(slice: P4PartSlice): number {
        display(P4Rules.VERBOSE, {
            text: 'P4Rules.getBoardValue called',
            board: slice.getCopiedBoard(),
        });
        return P4Rules.getBoardValueFromScratch(slice);
    }

    public applyLegalMove(move: P4Move,
                          slice: P4PartSlice,
                          status: LegalityStatus):
    { resultingMove: P4Move; resultingSlice: P4PartSlice; }
    {
        const x: number = move.x;
        const board: number[][] = slice.getCopiedBoard();
        const y: number = P4Rules.getLowestUnoccupiedCase(board, x);

        const turn: number = slice.turn;

        board[y][x] = slice.getCurrentPlayer().value;

        const resultingSlice: P4PartSlice = new P4PartSlice(board, turn+1);
        return { resultingMove: move, resultingSlice };
    }
    public isLegal(move: P4Move, slice: P4PartSlice): LegalityStatus {
        display(P4Rules.VERBOSE, { context: 'P4Rules.isLegal', move: move.toString(), slice });
        if (slice.getBoardByXY(move.x, 0) !== Player.NONE.value) {
            return { legal: MGPValidation.failure(P4Failure.COLUMN_IS_FULL) };
        }
        return { legal: MGPValidation.SUCCESS };
    }
    public getListMoves(node: P4Node): MGPMap<P4Move, P4PartSlice> {
        return P4Rules.getListMoves(node);
    }
    public getBoardValue(move: P4Move, slice: P4PartSlice): number {
        display(P4Rules.VERBOSE, {
            text: 'P4Rules instance methods getBoardValue called',
            board: slice.getCopiedBoard(),
        });
        return P4Rules.getBoardValue(slice);
    }
}
