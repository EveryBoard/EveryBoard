import { Direction } from '../../../jscaip/DIRECTION';
import { Coord } from '../../../jscaip/coord/Coord';
import { Rules } from '../../../jscaip/Rules';
import { SCORE } from '../../../jscaip/SCORE';
import { MGPNode } from '../../../jscaip/mgpnode/MGPNode';

import { P4PartSlice} from '../P4PartSlice';
import { MGPMap } from 'src/app/collectionlib/mgpmap/MGPMap';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/player/Player';
import { display } from 'src/app/collectionlib/utils';
import { MGPValidation } from 'src/app/collectionlib/mgpvalidation/MGPValidation';
import { P4Move } from '../P4Move';

export abstract class P4Node extends MGPNode<P4Rules, P4Move, P4PartSlice, LegalityStatus> {}

export class P4Rules extends Rules<P4Move, P4PartSlice, LegalityStatus> {

    public applyLegalMove(move: P4Move, slice: P4PartSlice, status: LegalityStatus): { resultingMove: P4Move; resultingSlice: P4PartSlice; } {
        const x: number = move.x;
        const board: number[][] = slice.getCopiedBoard();
        const y: number = P4Rules.getLowestUnoccupiedCase(board, x);

        const turn: number = slice.turn;

        board[y][x] = slice.getCurrentPlayer().value;

        const resultingSlice: P4PartSlice = new P4PartSlice(board, turn+1);
        return {resultingMove: move, resultingSlice};
    }
    // statics fields:

    public static VERBOSE: boolean = false;

    // statics methods:

    /* public static getBoardValueShortened(n: P4Node): number {
        // let mother: MGPNode<P4Rules, P4Move, P4PartSlice, LegalityStatus> = < MGPNode<P4Rules, P4Move, P4PartSlice, LegalityStatus> > n.getMother(); // is not null, otherwise this method should not have been called
        // let previousBoardValue: number = mother.getOwnValue(); // is not null either logically
        // let move: MoveCoord = < MoveCoord > n.getMove();
        // let x: number = move.coord.x;
        // let y: number = move.coord.y;
        // 1. for each direction where there is an ennemy block
        //  a. for the 1 to 3 ennemy block in a row
        display(P4Rules.VERBOSE, 'getBoardValueShortened appellée');

        return 0; // TODO
    } */
    public static getBoardValueFromScratch(slice: P4PartSlice): number {
        display(P4Rules.VERBOSE, { P4Rules_getBoardValueFromScratch: { slice }});
        const currentBoard: number[][] = slice.getCopiedBoard();
        let score: number = 0;
        let tmpScore: number = 0;
        let y: number;
        let x: number = 0;

        while (x < 7) {
            // pour chaque colonne
            y = 5; // on commence en bas
            while (y !== -1 && currentBoard[y][x] !== Player.NONE.value) {
                // tant qu'on a pas atteint le haut ni une case inoccupée

                tmpScore = P4Rules.getCaseScore(currentBoard, new Coord(x, y));
                if (MGPNode.getScoreStatus(tmpScore) !== SCORE.DEFAULT) {
                    // si on trouve un [pré]victoire
                    display(P4Rules.VERBOSE, { preVictoryOrVictory: { slice, tmpScore, coord: { x, y }}});
                    return tmpScore; // on la retourne
                    // TODO vérifier que PRE_VICTORY n'écrase pas les VICTORY dans ce cas ci
                }
                score += tmpScore;
                y--; // et on remonte
            }
            x++;
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
    public static getMod(camp: number): number {
        if (camp === Player.ZERO.value) {
            return -1;
        }
        if (camp === Player.ONE.value) {
            return +1;
        }
        throw new Error('Illegal case content for P4, nor X pawn nor O pawn.'); // NEW, shouldnt append
        // OLDDLY return 0; // shouldn't append
    }
    public static getHalfLineScore(board: number[][], i: Coord, dir: Direction, ennemi: number, allie: number): number[] {
        /* Anciennement nommé 'countLine'
       *
       * pour une case i(iX, iY) contenant un pion 'allie' (dont les ennemis sont naturellement 'ennemi'
       * on parcours le plateau à partir de i dans la direction d(dX, dY)
       * et ce à une distance maximum de 3 cases
       */

        let c: number; // current case
        let freeSpaces = 0; // le nombre de case libres alignées
        let allies = 0; // le nombre de case alliées alignées
        let allAlliesAreSideBySide = true;
        let co: Coord = new Coord(i.x + dir.x, i.y + dir.y);
        while (co.isInRange(7, 6) && freeSpaces !== 3) {
            // tant qu'on ne sort pas du plateau
            c = board[co.y][co.x];
            if (c === ennemi) {
                return [freeSpaces, allies];
            }
            if (c === allie && allAlliesAreSideBySide) {
                allies++;
            } else {
                allAlliesAreSideBySide = false; // on arrête de compter les alliées sur cette ligne
            }
            // dès que l'un d'entre eux n'est plus collé
            freeSpaces++;
            // co = new Coord(co.x + dir.x, co.y + dir.y);
            co = co.getNext(dir);
        }
        return [freeSpaces, allies];
    }
    public static getEnnemi(board: number[][], coord: Coord): number {
        const c: number = board[coord.y][coord.x];
        return (c === Player.NONE.value) ? Player.NONE.value
                                         : ((c === Player.ONE.value) ? Player.ZERO.value
                                                                     : Player.ONE.value);
    }
    public static getCaseScore(board: number[][], c: Coord): number {
        display(P4Rules.VERBOSE, 'getCaseScore(board, ' + c.x + ', ' + c.y + ') appellée');
        display(P4Rules.VERBOSE, board);

        if (board[c.y][c.x] === Player.NONE.value) {
            throw new Error('cannot call getCaseScore on empty case');
        }
        // anciennement nommé countPossibility
        let score: number = 0; // final result, count the theoretical victorys possibility
        let lineDist: number = 0;
        let lineAllies: number = 0;

        const ennemi: number = P4Rules.getEnnemi(board, c);
        const allie: number = board[c.y][c.x];

        const distByDirs: number[] = [];
        const alliesByDirs: number[] = [];

        let tmpDist: number;
        let tmpAllies: number;
        let tmpData: number[];
        let i: number = 0;
        for (const dir of Direction.DIRECTIONS) {
            tmpData = P4Rules.getHalfLineScore(board, c, dir, ennemi, allie);
            tmpDist = tmpData[0];
            tmpAllies = tmpData[1];
            distByDirs[i] = tmpDist;
            alliesByDirs[i] = tmpAllies;
            i++;
        }
        i = 0;
        while (i < 4) {
            // pour chaque duo de direction
            // lineAllies = 1 + alliesByDirs[i] + alliesByDirs[7 - i];
            lineAllies = alliesByDirs[i] + alliesByDirs[i + 4]; // in the two opposite dirs
            // System.out.println('lineAllies = ' + lineAllies + ' in (' + x + ', ' + y + ') pour dir ' + i);
            if (lineAllies > 2) {
                display(P4Rules.VERBOSE, { text:
                    'there is some kind of victory here (' + c.x + ', ' + c.y + ')' + '\n' +
                    'line allies : ' + lineAllies + '\n' +
                    'i : ' + i + '\n',
                    board
                });
                return allie === Player.ZERO.value
                    ? Number.MIN_SAFE_INTEGER
                    : Number.MAX_SAFE_INTEGER;
            }

            lineDist = distByDirs[i] + distByDirs[7 - i];
            if (lineDist >= 3) {
                score += lineDist - 2;
            }
            i++;
        }
        return score * P4Rules.getMod(allie);
    }
    /* public static countLinePossibility(board: number[][], i: Coord, d: Coord): number {
        // TODO countLinePossibility
        return 0;
    }*/
    /* public static getLineScore(line: number[], playable: boolean[], playableVictory: number[][]): number {
        // x + 0. count Victory
        // if victory return MAX/MIN: this must be the final result
        // x + 1. count monoVictory
        // if _one_ monoVictory payable of player X and it's he's turn:
        // return (MAX - 1)/(MIN + 1)
        // if two monoVictory playable return (MAX - 1)/(MIN + 1): this must be the final result
        // x + 2. count duoVictory in the rest that don't use the monoVictory
        // x + 3. count trioVictory in the rest that don't use nor monoVictory nor full group of duoVictory

        // TODO: implement
        return 0;
    } */
    /* public static getBoardValueByLine(n: P4Node): number {
        const partSlice: P4PartSlice = n.gamePartSlice;
        const board: number[][] = partSlice.getCopiedBoard();
        // calcul par ligne
        // ix, iy = i(x, y): i(init) est la coord début de la ligne à compter
        // dx, dy = d(x, y): d(direction) est le vecteur donnant la direction de la ligne
        let score = 0;
        let scoreStatut: SCORE;
        let tmpScore: number;
        let yMax = 0;

        const diagonalesDescendantes: boolean[] = [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ];
        // les diagonales descendantes ont pour indice (x + y) des cases qui passent par elles
        // x allant de 0 et 6 et y de 0 à 5: x + y va de 0 à 11
        // seules les 6 diagonales descendantes de 3 à 8 sont de longueur 4 ou plus
        // seules elles peuvent donc contenir un puissance 4

        const diagonalesMontantes: boolean[] = [
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false
        ];
        // les diagonales descendantes ont pour indice (x - y) des cases qui passent par elles
        // x allant de 0 et 6 et y de 0 à 5: x - y va de - 5 à 6
        // nous ne pouvons accepter un indice négatif, nous rajoutons donc 5 à x - y
        // seules les 6 diagonales montantes de - 2( + 5 = 3) à 3( + 5 = 8) sont de longueur 4 ou plus
        // seules elles peuvent donc contenir un puissance 4

        let y: number;
        let x = 0;
        while (x < 7) {
            if (board[0][x] !== Player.NONE.value) {
                y = 0;
                do {
                    tmpScore = this.getScoreColonne_A_TESTER(board, x);
                    scoreStatut = MGPNode.getScoreStatus(tmpScore);
                    if (scoreStatut !== SCORE.DEFAULT) {
                        return tmpScore;
                    }
                    score += tmpScore;

                    yMax = y > yMax ? y : yMax;

                    diagonalesDescendantes[x + y] = true; // voir commentaires des variables
                    diagonalesMontantes[x - y + 5] = true; // voir commentaires des variables

                    y++;
                } while (y < 6 && board[y][x] !== Player.NONE.value);
            }
            x++;
        }
        let d = 3;
        while (d < 9) {
            if (diagonalesDescendantes[d]) {
                tmpScore = P4Rules.getScoreDD(board, d);
                scoreStatut = MGPNode.getScoreStatus(tmpScore);
                if (scoreStatut !== SCORE.DEFAULT) {
                    return tmpScore;
                }
                score += tmpScore;
            }
            if (diagonalesMontantes[d]) {
                tmpScore = P4Rules.getScoreDM(board, d);
                scoreStatut = MGPNode.getScoreStatus(tmpScore);
                if (scoreStatut !== SCORE.DEFAULT) {
                    return tmpScore;
                }
                score += tmpScore;
            }
            d++;
        }
        while (yMax > 0) {
            tmpScore = P4Rules.getScoreHorizontal(board, yMax);
            scoreStatut = MGPNode.getScoreStatus(tmpScore);
            if (scoreStatut !== SCORE.DEFAULT) {
                return tmpScore;
            }
            score += tmpScore;
            yMax--;
        }
        display(P4Rules.VERBOSE, 'board Value evaluated without (pre)victory to ' + score);

        return score;
    }*/
    /* public static getScoreColonne_A_TESTER(board: number[][], x: number): number {
        let nInALine = 1;
        const upperFound = false; // il n'y aura dans une rangée qu'une seule case jouable
        let aligner: number = board[0][x]; // toujours occupé si on appelle cette rangée
        const line: number[] = [
            aligner,
            Player.NONE.value,
            Player.NONE.value,
            Player.NONE.value,
            Player.NONE.value,
            Player.NONE.value
        ];
        const playableVictory: number[][] = [[-1, -1], [-1, -1]]; // TODO ADAPTER ça aux autres
        const playable: boolean[] = [false, false, false, false, false, false];
        let c: number; // current case
        let y = 1;
        while (y < 6) {
            c = board[y][x];
            line[y] = c;
            if (c === aligner) {
                // si cette case est du même genre que la précédente
                nInALine++; // il en a donc une de plus d'alignée
            } else {
                // cette case est différente de la précédente
                if (nInALine === 4) {
                    display(P4Rules.VERBOSE, 'there is some kind of victory here 2');

                    return aligner === Player.ZERO.value
                        ? Number.MIN_SAFE_INTEGER
                        : Number.MAX_SAFE_INTEGER;
                }
                if (c === Player.NONE.value) {
                    playable[y] = true;
                    return P4Rules.getLineScore(line, playable, playableVictory);
                }
                nInALine = 1;
                aligner = c;
            }
            y++;
        }
        if (nInALine === 4) {
            display(P4Rules.VERBOSE, 'there is some kind of victory here 3');

            return aligner === Player.ZERO.value
                ? Number.MIN_SAFE_INTEGER
                : Number.MAX_SAFE_INTEGER;
        }
        return P4Rules.getLineScore(line, playable, playableVictory);
    }*/
    /* public static getScoreDD(board: number[][], d: number): number {
        // TODO getScoreDD
        return 0;
    }*/
    /* public static getScoreDM(board: number[][], d: number): number {
        // TODO getScoreDM
        return 0;
    }*/
    /* public static getScoreHorizontal(board: number[][], y: number): number {
        // TODO getScoreHorizontal
        return 0;
    }*/
    // static delegates

    public static getListMoves(node: P4Node): MGPMap<P4Move, P4PartSlice> {
        display(P4Rules.VERBOSE, { context: 'P4Rules.getListMoves', node });

        // ne doit être appellé que si cette partie n'est pas une partie finie
        const originalPartSlice: P4PartSlice = node.gamePartSlice;
        const originalBoard: number[][] = originalPartSlice.getCopiedBoard();
        const retour: MGPMap<P4Move, P4PartSlice> = new MGPMap<P4Move, P4PartSlice>();
        const turn: number = originalPartSlice.turn;
        let y: number;
        let move: P4Move;

        let x: number = 0;
        while (x < 7) {
            if (originalPartSlice.getBoardByXY(x, 0) === Player.NONE.value) {
                y = P4Rules.getLowestUnoccupiedCase(originalBoard, x);

                move = P4Move.of(x);
                let newBoard: number[][] = originalPartSlice.getCopiedBoard();

                newBoard[y][x] = originalPartSlice.getCurrentPlayer().value;

                const newPartSlice = new P4PartSlice(newBoard, turn + 1);

                retour.set(move, newPartSlice);
            }
            x++;
        }
        return retour;
    }
    public static getBoardValue(slice: P4PartSlice): number {
        /* if (n.getMother() == null) {
          return P4Rules.getBoardValueFromScratch(n);
        } else {
          return P4Rules.getBoardValueShortened(n);
        }
        */
       display(P4Rules.VERBOSE, {
            text: 'P4Rules.getBoardValue called',
            board: slice.getCopiedBoard()
        });
        return P4Rules.getBoardValueFromScratch(slice);
    }
    // Overrides:

    public isLegal(move: P4Move, slice: P4PartSlice): LegalityStatus {
        display(P4Rules.VERBOSE, { context: "P4Rules.isLegal", move: move.toString(), slice});
        if (move.x < 0 || move.x > 6) {
            // TODO: P4Move should become P4Move, having X0 to X6 static instances, so this line is deleted
            return { legal: MGPValidation.failure("invalid move") };
        }
        if (slice.getBoardByXY(move.x, 0) !== Player.NONE.value) {
            return { legal: MGPValidation.failure("Column " + move.x + " is full.") };
        }
        return {legal: MGPValidation.SUCCESS};
    }
    public getListMoves(node: P4Node): MGPMap<P4Move, P4PartSlice> {
        return P4Rules.getListMoves(node);
    }
    public getBoardValue(move: P4Move, slice: P4PartSlice): number {
        display(P4Rules.VERBOSE, {
            text: 'P4Rules instance methods getBoardValue called',
            board: slice.getCopiedBoard()
        });
        return P4Rules.getBoardValue(slice);
    }
}
