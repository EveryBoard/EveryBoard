import {Rules} from '../../jscaip/Rules';
import {MNode} from '../../jscaip/MNode';
import {Move} from '../../jscaip/Move';
import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {AwalePartSlice} from './AwalePartSlice';
import { AwaleMove } from './AwaleMove';
import { MGPMap } from 'src/app/collectionlib/MGPMap';
import { AwaleLegalityStatus } from './AwaleLegalityStatus';

export class AwaleRules extends Rules<AwaleMove, AwalePartSlice, AwaleLegalityStatus> {

    public applyLegalMove(move: AwaleMove, slice: AwalePartSlice, status: AwaleLegalityStatus): { resultingMove: AwaleMove; resultingSlice: AwalePartSlice; } {
        const turn: number = slice.turn;
        const player = turn % 2;
        const ennemy = (turn + 1) % 2;

        const x: number = move.coord.x;
        const y: number = move.coord.y;
        
        const moveAndResult = new AwaleMove(x, y, status.captured);
        const awalePartSlice: AwalePartSlice = this.node.gamePartSlice;
        const captured: number[] = awalePartSlice.getCapturedCopy();

        captured[player] += status.captured[player];
        captured[ennemy] += status.captured[ennemy];

        const resultingSlice: AwalePartSlice = new AwalePartSlice(status.resultingBoard, turn + 1, captured);
        return {resultingSlice, resultingMove: move};
    }

    static VERBOSE = false;

    private static mansoon(mansooningPlayer: number, board: number[][]): number {
        /* capture all the seeds of the mansooning player
         * return the sum of all captured seeds
         * is called when a game is over because of starvation
         */
        console.log('mansoon');
        let sum = 0;
        let x = 0;
        do {
            sum += board[mansooningPlayer][x];
            board[mansooningPlayer][x] = 0;
            x++;
        } while (x < 6);
        return sum;
    }

    public isLegal(move: AwaleMove, slice: AwalePartSlice): AwaleLegalityStatus {
        /* modify the move to addPart the capture
         * modify the board to get the after-move result
         * return -1 if it's not legal, if so, the board should not be affected
         * return the number captured otherwise
         */

        const ILLEGAL: AwaleLegalityStatus = {legal: false, captured: null, resultingBoard: null};
        const turn: number = slice.turn;
        let resultingBoard: number[][] = slice.getCopiedBoard();

        let captured = [0, 0];

        if (AwaleRules.VERBOSE) {
            console.log('\nin getLegality(' + move.toString() + ', ' + turn + ', ' + AwaleRules.printInLine(resultingBoard) + ')');
        }
        const y: number = move.coord.y;
        const player: number = turn % 2;
        const ennemi: number = (turn + 1) % 2;

        if (y !== player) {
            if (AwaleRules.VERBOSE) console.log('on ne distribue pas la maison des autres!!');
            return ILLEGAL; // on ne distribue que ses maisons
        }
        const x: number = move.coord.x;
        if (resultingBoard[y][x] === 0) {
            if (AwaleRules.VERBOSE) console.log('on ne distribue pas un de ses maisons vides!!');
            return ILLEGAL; // on ne distribue pas une case vide
        }

        if (!AwaleRules.doesDistribute(x, y, resultingBoard) && AwaleRules.isStarving(ennemi, resultingBoard) ) {
            // you can distribute but you don't, illegal move
            if (AwaleRules.VERBOSE) console.log('you can distribute but you don\'t, illegal move');
            return ILLEGAL;
        }
        // arrived here you can distribute this house
        // but we'll have to check if you can capture
        if (AwaleRules.VERBOSE) {
            console.log('arrived here you can distribute this house but we\'ll have to check if you can capture');
        }
        const lastCase: number[] = AwaleRules.distribute(x, y, resultingBoard); // do the distribution and retrieve the landing part
        // of the last stone
        const landingCamp: number = lastCase[1];
        if (landingCamp === player) {
            if (AwaleRules.VERBOSE) {
                console.log('distribution terminée dans son propre camps');
            }
            // on termine la distribution dans son propre camp, rien d'autre à v�rifier
            return {legal: true, captured: [0, 0], resultingBoard};
        }
        // on as donc terminé la distribution dans le camps adverse, capture est de mise
        const boardBeforeCapture: number[][] = GamePartSlice.copyBiArray(resultingBoard);
        captured[player] = AwaleRules.capture(lastCase[0], ennemi, player, resultingBoard);
        if (AwaleRules.isStarving(ennemi, resultingBoard)) {
            if (captured[player] > 0) {
                // if the distribution would capture all seeds
                if (AwaleRules.VERBOSE) {
                    console.log('mouvement légal mais capture annulée pour cause de sécheresse');
                }
                // the move is legal but the capture is forbidden and cancelled
                resultingBoard = boardBeforeCapture; // undo the capturing
                captured = [0, 0];
            }
        }
        if (AwaleRules.isStarving(player, resultingBoard) && !AwaleRules.canDistribute(ennemi, resultingBoard)) {
            // if the player distributed his last seeds and the opponent could not give him seeds
            if (AwaleRules.VERBOSE) {
                console.log('You just gave you last seed on the opponent could not give it back to you');
            }
            captured[ennemi] += AwaleRules.mansoon(ennemi, resultingBoard);
        }

        move = new AwaleMove(x, y, captured);
        return {legal: true, captured, resultingBoard};
    }

    private static printInLine(board: number[][]): string {
        let retour = '';
        let y = 0;
        let x;
        do {
            x = 0;
            do {
                retour += ':' + board[y][x++];
            } while (x < 6);
            y++;
        } while (y < 2);
        return retour;
    }

    private static doesDistribute(x: number, y: number, board: number[][]): boolean {
        if (y === 0) { // distribution from left to right
            return board[y][x] > (5 - x);
        }
        return board[y][x] > x; // distribution from right to left
    }

    private static canDistribute(player: number, board: number[][]): boolean {
        let x = 0;
        do {
            if (AwaleRules.doesDistribute(x++, player, board)) {
                return true;
            }
        } while (x < 6);
        return false;
    }

    private static isStarving(player: number, board: number[][]): boolean {
        const localVerbose = false;

        if (AwaleRules.VERBOSE || localVerbose) {
            console.log('isStarving(' + player + ', ' + AwaleRules.printInLine(board) + ')=');
        }
        let i = 0;
        do {
            if (board[player][i++] > 0) {
                if (AwaleRules.VERBOSE || localVerbose) {
                    console.log('false');
                }
                return false; // found some food there, so not starving
            }
        } while (i < 6);
        if (AwaleRules.VERBOSE || localVerbose) {
            console.log('true');
        }
        return true;
    }

    private static distribute(x: number, y: number, board: number[][]): number[] {
        // just apply's the move on the board (the distribution part)
        // does not make the capture nor verify the legality of the move
        // return (x, y) of the last case the move got down
        if (AwaleRules.VERBOSE) {
            console.log('distribute(' + x + ', ' + y + ', ' +  AwaleRules.printInLine(board) + ')=');
        }
        let ix, iy;
        ix = x;
        iy = y; // iy et ix sont les cases initiales
        // à retenir pour appliquer la règle de la jachère en cas de tour complet
        let inHand = board[y][x];
        board[y][x] = 0; // on vide la case
        while (inHand > 0) {
            // get next case
            if (y === 0) {
                if (x === 5) {
                    y = 1; // passage de frontière du bas vers le haut
                } else {
                    x++; // sens horloger en haut = de gauche à droite
                }
            } else {
                if (x === 0) {
                    y = 0; // passage de frontière du haut vers le bas
                } else {
                    x--; // sens horloger en bas = de droite à gauche
                }
            }
            if ((x !== ix) || (y !== iy)) {
                // pour appliquer la règle de jachère
                board[y][x] += 1;
                inHand--; // on dépose dans cette case une pierre qu'on a en main
            }
        }
        if (AwaleRules.VERBOSE) {
            console.log('(' + x + ', ' + y + ')');
        }
        return [x, y] ;
    }

    private static capture(x: number, y: number, player: number, board: number[][]): number {
        /* only called if y and player are not equal
         * if the condition are make to make an capture into the ennemi's side are met
         * capture and return the number of captured
         * capture even if this could mean doing an illegal starvation
         */

        let target = board[y][x];
        if ((target < 2) || (target > 3)) {
            return 0; // first case not capturable
        }

        let captured = 0;
        let direction = -1 ; // by defaut, capture from right to left
        let limite = -1;
        if (player === 0) {
            /* if turn == 0 capture is on the bottom line
             * means capture goes from left to right ( + 1)
             * so one ending condition of the loop is reaching index 6
             */
            direction =  + 1;
            limite = 6;
        }

        do {
            captured += target; // we addPart to the player score the captured seeds
            board[y][x] = 0; // since now they're capture, we get them off the board
            console.log('case (' + x + ', ' + y + ') capturée');
            x += direction;
        } while ((x !== limite) && (((target = board[y][x]) === 2) || (target === 3)));
        return captured;
    }

    public getListMoves(n: MNode<AwaleRules, AwaleMove, AwalePartSlice, AwaleLegalityStatus>): MGPMap<AwaleMove, AwalePartSlice> {
        const localVerbose = false ;
        if (AwaleRules.VERBOSE || localVerbose) {
            console.log('getListMoves');
        }

        const choices: MGPMap<AwaleMove, AwalePartSlice> = new MGPMap<AwaleMove, AwalePartSlice>();
        const turn: number = n.gamePartSlice.turn;
        const player: number = turn % 2;
        let newMove: AwaleMove;
        let newSlice: AwalePartSlice;
        const oldSlice: AwalePartSlice = n.gamePartSlice;
        let x = 0;
        do {
            // for each house that might be playable

            // if (AwaleRules.VERBOSE || localVerbose) Console.log('trying to find one awale move-partSlice');
            if (n.gamePartSlice.getBoardByXY(x, player) !== 0) {
                // if the house is not empty

                // if (AwaleRules.VERBOSE || localVerbose) Console.log('non empty case at (' + x + ', ' + player + ')');
                newMove = new AwaleMove(x, player, []);
                const boardArray: number[][] = n.gamePartSlice.getCopiedBoard();
                const legality: AwaleLegalityStatus = this.isLegal(newMove, oldSlice); // see if the move is legal

                // if (AwaleRules.VERBOSE || localVerbose) Console.log('legality is ' + moveResult);
                if (legality.legal) {
                    // if the move is legal, we addPart it to the listMoves
                    const capturedCopy: number[] = oldSlice.getCapturedCopy();
                    capturedCopy[player] += legality.captured[player];
                    capturedCopy[(player + 1) % 2] += legality.captured[(player + 1) % 2];
                    newMove = new AwaleMove(x, player, legality.captured);

                    newSlice = new AwalePartSlice(boardArray, turn + 1, capturedCopy);
                    choices.put(newMove, newSlice);
                }
            }
            x++;
        } while (x < 6);

        if (AwaleRules.VERBOSE || localVerbose) {
            console.log(n + ' has ' + choices.size() + ' choices');
        }
        return choices;
    }

    public getBoardValue(n: MNode<AwaleRules, AwaleMove, AwalePartSlice, AwaleLegalityStatus>): number {
        const localVerbose = false;

        if (AwaleRules.VERBOSE || localVerbose) {
            console.log('GBV..');
        }

        const player: number = n.gamePartSlice.turn % 2;
        const ennemy = (player + 1) % 2;
        const awalePartSlice: AwalePartSlice = n.gamePartSlice;
        const captured: number[] = awalePartSlice.captured;
        const c1 = captured[1];
        const c0 = captured[0];
        const board: number[][] = n.gamePartSlice.getCopiedBoard();
        if (AwaleRules.isStarving(player, board)) { // TODO tester de l'enlever
            if (!AwaleRules.canDistribute(ennemy, board)) {
                return (c0 > c1) ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
            }
        }

        if (c1 > 24) {
            return Number.MAX_SAFE_INTEGER;
        }
        if (c0 > 24) {
            return Number.MIN_SAFE_INTEGER;
        }
        return c1 - c0;
    }

    OLD_choose(resultlessMove: AwaleMove): boolean {
        if (this.node.hasMoves()) { // if calculation has already been done by the AI
            const choix: MNode<AwaleRules, AwaleMove, AwalePartSlice, AwaleLegalityStatus> = this.node.getSonByMove(resultlessMove); // let's not doing if twice
            if (choix != null) {
                this.node = choix; // qui devient le plateau actuel
                return true;
            }
        }
        const turn: number = this.node.gamePartSlice.turn;
        const player = turn % 2;
        const ennemy = (turn + 1) % 2;
        const x: number = resultlessMove.coord.x;
        const y: number = resultlessMove.coord.y;
        if (AwaleRules.VERBOSE) {
            console.log('choose(' + resultlessMove.toString() + ') -> ' + ' at turn ' + turn);
        }
        const board: number[][] = this.node.gamePartSlice.getCopiedBoard();
        const legality: AwaleLegalityStatus = this.isLegal(resultlessMove, this.node.gamePartSlice);
        if (legality.legal === false) {
            return false;
        }

        const moveAndResult = new AwaleMove(x, y, legality.captured);
        const awalePartSlice: AwalePartSlice = this.node.gamePartSlice;
        const captured: number[] = awalePartSlice.getCapturedCopy();

        captured[player] += legality.captured[player];
        captured[ennemy] += legality.captured[ennemy];

        const newPartSlice: AwalePartSlice = new AwalePartSlice(board, turn + 1, captured);
        const son: MNode<AwaleRules, AwaleMove, AwalePartSlice, AwaleLegalityStatus> = new MNode(this.node, moveAndResult, newPartSlice);
        this.node = son;
        return true;
    }

    public setInitialBoard() {
        if (this.node == null) {
            this.node = MNode.getFirstNode(
                new AwalePartSlice(AwalePartSlice.getStartingBoard(), 0, [0, 0]),
                this
            );
        } else {
            this.node = this.node.getInitialNode();
        }
    }
}