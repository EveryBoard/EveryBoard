import {DIRECTION, ORTHOGONALE, ORTHOGONALES} from '../../jscaip/DIRECTION';
import {Rules} from '../../jscaip/Rules';
import {Coord} from '../../jscaip/Coord';
import {MNode} from '../../jscaip/MNode';
import {TablutPartSlice} from './TablutPartSlice';
import { TablutMove } from './TablutMove';
import { MGPMap } from 'src/app/collectionlib/MGPMap';

export class TablutRules extends Rules {
    static VERBOSE = false;

    // statics fields :


    static CASTLE_IS_LEFT_FOR_GOOD = false;
    // once the king leave the castle he cannot re-station there
    static NORMAL_CAPTURE_WORK_ON_THE_KING = false;
    // king can be capture by only two opposed invaders
    static CAPTURE_KING_AGAINST_THRONE_RULES = false;
    // the throne is considered an ennemy to the king
    static CAPTURE_PAWN_AGAINST_THRONE_RULES = true;
    // the throne is considered an ennemy to the pawn
    static THREE_INVADER_AND_A_BORDER_CAN_CAPTURE_KING = true;
    // the king can be captured by only three invaders if he's against the corner

    static readonly WIDTH = 9;

    static readonly SUCCESS = 10;
    static readonly NOT_IN_RANGE_ERROR = 20;
    static readonly IMMOBILE_MOVE_ERROR = 21;
    static readonly NOT_ORTHOGONAL_ERROR = 22;
    static readonly SOMETHING_IN_THE_WAY_ERROR = 23;
    static readonly PAWN_COORD_UNOCCUPIED_ERROR = 24;
    static readonly MOVING_OPPONENT_PIECE_ERROR = 25;
    static readonly LANDING_ON_OCCUPIED_CASE_ERROR = 26;
    static readonly PAWN_LANDING_ON_THRONE_ERROR = 27;
    static readonly CASTLE_IS_LEFT_FOR_GOOD_ERROR = 28;

    private static readonly NONE = 50;
    private static readonly ENNEMY = 51;
    private static readonly PLAYER = 52;

    // statics methods :

    private static tryMove(player: 0|1, invaderStart: boolean, move: TablutMove, board: number[][]): {success: number, resultingMove: TablutMove} {
        // TODO: shouldn't all Rules have a "tryMove" who modify the move and partSlice parameter and return an integer status
        const errorValue: number = this.getMoveValidity(player, invaderStart, move, board);
        if (errorValue !== this.SUCCESS) {
            return {success: errorValue, resultingMove: null};
        }

        // move is legal here
        const depart: Coord = move.coord;
        const arrival: Coord = move.end;
        board[arrival.y][arrival.x] = board[depart.y][depart.x]; // d�doublement
        board[depart.y][depart.x] = TablutPartSlice.UNOCCUPIED; // suppression du pr�c�dent
        const captureds: Coord[] = [];
        let captured: Coord;
        for (const d of ORTHOGONALES) {
            if (TablutRules.VERBOSE) {
                console.log('tryCapture from tryMove(' + move + ') with direction (' + d.x + ', ' + d.y + ')');
            }
            captured = this.tryCapture(player, invaderStart, move.end, d, board);
            if (captured != null) {
                captureds.push(captured);
                // if (!this.isKing(board[captured.y][captured.x])) {
                    board[captured.y][captured.x] = TablutPartSlice.UNOCCUPIED; // do capture, unless if king
                // }
            }
        }
        let newMove: TablutMove = new TablutMove(move.coord, move.end, captureds);
        return {success: this.SUCCESS, resultingMove: newMove};
    }

    private static getMoveValidity(player: 0|1, invaderStart: boolean, move: TablutMove, board: number[][]): number {
        if (!move.coord.isInRange(this.WIDTH, this.WIDTH)) { // TODO: implément height so he leave me be
            return this.NOT_IN_RANGE_ERROR;
        }
        if (!move.end.isInRange(this.WIDTH, this.WIDTH)) {
            return this.NOT_IN_RANGE_ERROR;
        }
        const cOwner: number = this.getRelativeOwner(player, invaderStart, move.coord, board);
        if (cOwner === this.NONE) {
            return this.PAWN_COORD_UNOCCUPIED_ERROR;
        }
        if (cOwner === this.ENNEMY) { // TODO OwnerEnum/Type
            return this.MOVING_OPPONENT_PIECE_ERROR;
        }

        const landingCoordOwner: number = this.getRelativeOwner(player, invaderStart, move.end, board);
        if (landingCoordOwner !== this.NONE) {
            return this.LANDING_ON_OCCUPIED_CASE_ERROR;
        }
        if (this.isThrone(move.end)) {
            if (this.isKing(board[move.coord.y][move.coord.x])) {
                if (this.isCentralThrone(move.end) && this.CASTLE_IS_LEFT_FOR_GOOD) {
                    return this.CASTLE_IS_LEFT_FOR_GOOD_ERROR;
                }
            } else {
                return this.PAWN_LANDING_ON_THRONE_ERROR;
            }
        }

        const dir: DIRECTION = move.coord.getDirectionToward(move.end);
        if (dir == null) {
            return this.IMMOBILE_MOVE_ERROR;
        }

        if (!DIRECTION.isOrthogonal(dir)) {
            return this.NOT_ORTHOGONAL_ERROR;
        }
        const dist: number = move.coord.getOrthogonalDistance(move.end);
        let c: Coord = move.coord.getNext(dir); // the inspected coord
        for (let i = 1; i < dist; i++) {
            if (board[c.y][c.x] !== TablutPartSlice.UNOCCUPIED) {
                return this.SOMETHING_IN_THE_WAY_ERROR;
            }
            c = c.getNext(dir);
        }
        return this.SUCCESS;
    }

    private static tryCapture(player: 0|1, invaderStart: boolean, landingPawn: Coord, d: ORTHOGONALE, board: number[][]): Coord {
        const localVerbose = false;
        /* landingPawn is the piece that just moved
         * d the direction in witch we look for capture
         * return the captured coord, or null if no capture possible
         * 1. the threatened case dont exist         -> no capture
         * 2: the threatened case is not an ennemy   -> no capture
         * 3: the threatened case is a king -> delegate calculation
         * 4: the threatened case is a pawn -> delegate calculation
         */
        const threatened: Coord = landingPawn.getNext(d);
        if (!threatened.isInRange(this.WIDTH, this.WIDTH)) {
            return null; // 1: the threatened case dont exist, no capture
        }
        const threatenedPawnOwner: number = this.getRelativeOwner(player, invaderStart, threatened, board);
        if (threatenedPawnOwner !== this.ENNEMY) {
            return null; // 2: the threatened case is not an ennemy
        }
        if (this.isKing(board[threatened.y][threatened.x])) {
            return this.captureKing(player, invaderStart, landingPawn, d, board);
        }
        return this.capturePawn(player, invaderStart, landingPawn, d, board);
    }

    private static isKing(piece: number): boolean {
        return (piece === TablutPartSlice.PLAYER_ZERO_KING) || (piece === TablutPartSlice.PLAYER_ONE_KING);
    }

    private static captureKing(player: 0|1, invaderStart: boolean, landingPiece: Coord, d: ORTHOGONALE, board: number[][]): Coord {
        /* the king is the next coord after c (in direction d)
         * the landingPiece partipate in the capture
         *
         *  1: allied is out-of-range
         *      2: if two other are invaders AND LEGAL                  -> capture king (1 border + 3 invaders)
         *      3: if one invaders and one empty throne
         *          3.1: if king capturable by empty-throne and borders -> capture king (1 border, 1 throne, 2 invaders)
         *  4: back is empty
         *      5: if back is not a throne                              -> no capture
         *      here, back is an empty throne
         *      6: if king not capturable by empty throne               -> no capture
         *      7: if king capturable by 2                              -> capture king (1 invader + throne)
         *      8: else if two-other-coord are invader                  -> capture king (3 invaders + throne)
         *  9: allied is an invader
         *     10: if king is capturable by two                         -> capture king (2 invaders)
         *     11: if 2 others around king are invaders                 -> capture king (4 invaders)
         * So these are the different victory way for the invaders :
         * - 2 invaders
         * - 1 invaders 1 empty-throne
         * - 3 invaders 1 throne
         * - 2 invaders 1 throne 1 border
         * - 3 invaders 1 border
         * - 4 invaders
         */
        // console.log('capture pawn from ' + player + ' : and ' + landingPiece + ' : (' + d.x + ', ' + d.y + ')');
        const localVerbose = false;
        const kingCoord: Coord = landingPiece.getNext(d);

        const backCoord: Coord = kingCoord.getNext(d); // the piece that just move is always considered in front
        const backInRange: boolean = backCoord.isInRange(this.WIDTH, this.WIDTH);
        const back: number = backInRange ?
            this.getRelativeOwner(player, invaderStart, backCoord, board) :
            this.NONE;

        const leftCoord: Coord = kingCoord.getLeft(d);
        const leftInRange: boolean = leftCoord.isInRange(this.WIDTH, this.WIDTH);
        const left: number = leftInRange ?
            this.getRelativeOwner(player, invaderStart, leftCoord, board) :
            this.NONE;

        const rightCoord: Coord = kingCoord.getRight(d);
        const rightInRange: boolean = rightCoord.isInRange(this.WIDTH, this.WIDTH);
        const right: number = rightInRange ?
            this.getRelativeOwner(player, invaderStart, rightCoord, board) :
            this.NONE;

        if (!backInRange) { /////////////////////// 1
            let nbInvaders: number = (left === this.PLAYER ? 1 : 0);
            nbInvaders += (right === this.PLAYER ? 1 : 0);
            if (nbInvaders === 2 && this.THREE_INVADER_AND_A_BORDER_CAN_CAPTURE_KING) { // 2
                // king captured by 3 invaders against 1 border
                if (TablutRules.VERBOSE || localVerbose) {
                    console.log('king captured by 3 invaders against 1 border'); }
                return kingCoord;
            } else if (nbInvaders === 1) {
                if (this.isEmptyThrone(leftCoord, board) ||
                    this.isEmptyThrone(rightCoord, board)) {
                    if (this.CAPTURE_KING_AGAINST_THRONE_RULES) { //////////////////////// 3
                        // king captured by 1 border, 1 throne, 2 invaders
                        if (TablutRules.VERBOSE || localVerbose) {
                            console.log('king captured by 3 invaders against 1 border'); }
                        return kingCoord;
                    }
                }
            }
            // those were the only two way to capture against the borde
            return null;
        }
        if (back === this.NONE) { //////////////////////////////////////////////////////// 4
            if (!this.isThrone(backCoord)) { ///////////////////////////////////////////// 5
                return null;
            } // here, back is an empty throne
            if (!this.CAPTURE_KING_AGAINST_THRONE_RULES) { /////////////////////////////// 6
                return null;
            } // here king is capturable by this empty throne
            if (this.NORMAL_CAPTURE_WORK_ON_THE_KING) { ////////////////////////////////// 7
                if (TablutRules.VERBOSE || localVerbose) {
                    console.log('king captured by 1 invader and 1 throne'); }
                return kingCoord; // king captured by 1 invader and 1 throne
            }
            if (left === this.PLAYER && right === this.PLAYER) {
                if (TablutRules.VERBOSE || localVerbose) {
                    console.log('king captured by 3 invaders + 1 throne'); }
                return kingCoord; // king captured by 3 invaders + 1 throne
            }
        }
        if (back === this.PLAYER) {
            if (this.NORMAL_CAPTURE_WORK_ON_THE_KING) {
                if (TablutRules.VERBOSE || localVerbose) {
                    console.log('king captured by two invaders'); }
                return kingCoord; // king captured by two invaders
            }
            if (left === this.PLAYER && right === this.PLAYER) {
                if (TablutRules.VERBOSE || localVerbose) {
                    console.log('king captured by 4 invaders'); }
                return kingCoord; // king captured by 4 invaders
            }
        }
        return null;
    }

    private static capturePawn(player: 0|1, invaderStart: boolean, c: Coord, d: ORTHOGONALE, board: number[][]): Coord {
        /* the pawn is the next coord after c (in direction d)
         * c partipate in the capture
         *
         * So these are the different capture ways :
         * - 2 ennemies
         * - 1 ennemies 1 empty-throne
         */
        const localVerbose = false;

        const threatenedPieceCoord: Coord = c.getNext(d);

        const backCoord: Coord = threatenedPieceCoord.getNext(d); // the piece that just move is always considered in front
        if (!backCoord.isInRange(this.WIDTH, this.WIDTH)) {
            if (TablutRules.VERBOSE || localVerbose) {
                console.log('cannot capture a pawn against a wall; ' + threatenedPieceCoord + 'threatened by ' + player + '\'s pawn in  ' + c
                    + ' coming from this direction (' + d.x + ', ' + d.y + ')');
            }
            return null; // no ally no sandwich (against pawn)
        }

        const back: number = this.getRelativeOwner(player, invaderStart, backCoord, board);
        if (back === this.NONE) {
            if (!this.isThrone(backCoord)) {
                if (TablutRules.VERBOSE || localVerbose) {
                    console.log('cannot capture a pawn without an ally; ' + threatenedPieceCoord + 'threatened by ' + player + '\'s pawn in  ' + c
                        + ' coming from this direction (' + d.x + ', ' + d.y + ')');
                    console.log('cannot capture a pawn without an ally behind');
                }
                return null;
            } // here, back is an empty throne
            if (this.CAPTURE_PAWN_AGAINST_THRONE_RULES) {
                if (TablutRules.VERBOSE || localVerbose) {
                    console.log('pawn captured by 1 ennemy and 1 throne; ' + threatenedPieceCoord + 'threatened by ' + player + '\'s pawn in  ' + c
                        + ' coming from this direction (' + d.x + ', ' + d.y + ')');
                }
                return threatenedPieceCoord; // pawn captured by 1 ennemy and 1 throne
            }
        }
        if (back === this.PLAYER) {
            if (TablutRules.VERBOSE || localVerbose) {
                console.log('pawn captured by 2 ennemies; ' + threatenedPieceCoord + 'threatened by ' + player + '\'s pawn in  ' + c
                    + ' coming from this direction (' + d.x + ', ' + d.y + ')');
            }
            return threatenedPieceCoord; // pawn captured by two ennemies
        }
        if (TablutRules.VERBOSE || localVerbose) {
            if (TablutRules.VERBOSE || localVerbose) {
                console.log('no captures; ' + threatenedPieceCoord + 'threatened by ' + player + '\'s pawn in  ' + c
                    + ' coming from this direction (' + d.x + ', ' + d.y + ')');
            }
        }
        return null;
    }

    private static isEmptyThrone(c: Coord, board: number[][]): boolean {
        if (this.isThrone(c)) {
            return board[c.y][c.x] === TablutPartSlice.UNOCCUPIED;
        }
        return false;
    }

    public static isThrone(c: Coord): boolean {
        if (this.isExternalThrone(c)) {
            return true;
        } else {
            return this.isCentralThrone(c);
        }
    }

    private static isExternalThrone(c: Coord) {
        const fin = this.WIDTH - 1;
        if (c.x === 0) {
            return (c.y === 0) || (c.y === fin);
        } else if (c.x === fin) { // TODO: c'est à TablutPartSlice d'avoir largeur ! pas aux règles
            return (c.y === 0) || (c.y === fin);
        }
        return false;
    }

    private static isCentralThrone(c: Coord): boolean {
        let center = this.WIDTH / 2;
        center -= center % 2;
        return (c.x === center && c.y === center);
    }

    private static getAbsoluteOwner(c: Coord, invaderStart: boolean, board: number[][]): -1 | 0 | 1 {
        const case_c: number = board[c.y][c.x];
        let owner: -1 | 0 | 1;
        switch (case_c) {
            case TablutPartSlice.PLAYER_ZERO_KING:
                owner = 0;
                break;
            case TablutPartSlice.PLAYER_ONE_KING:
                owner = 1;
                break;
            case TablutPartSlice.INVADERS:
                owner = invaderStart ? 0 : 1;
                break;
            case TablutPartSlice.DEFENDERS:
                owner = invaderStart ? 1 : 0;
                break;
            case TablutPartSlice.UNOCCUPIED:
                owner = -1;
                break;
            default :
                throw new Error('Invalid value on the board');
        }
        return owner;
    }

    static getRelativeOwner(player: 0|1, invaderStart: boolean, c: Coord, board: number[][]): number {
        if (!c.isInRange(TablutRules.WIDTH, TablutRules.WIDTH)) {
            throw new Error('cannot call getRelativeOwner on Out Of Range Coord' + c);
        }
        const case_c: number = board[c.y][c.x];
        const owner: -1 | 0 | 1 = this.getAbsoluteOwner(c, invaderStart, board);
        let relativeOwner: number;
        if (owner === -1) {
            relativeOwner = this.NONE;
        } else if (owner === player) {
            relativeOwner = this.PLAYER;
        } else {
            relativeOwner = this.ENNEMY;
        }
        // TESTS
        if (case_c === TablutPartSlice.UNOCCUPIED) {
            if (relativeOwner !== this.NONE) {
                console.log('WTF, empty is on no one side but here is on ' + relativeOwner + ' :: ' + owner + ' :: ' + player); }
        } else if (player === 0) {
            if (case_c === TablutPartSlice.INVADERS) {
                if (invaderStart) {
                    if (relativeOwner !== this.PLAYER) {
                        console.log('player start, invader start, case is invader, but player don\'t own the case '
                            + relativeOwner + ' :: ' + owner + ' :: ' + player);
                    }
                } else {
                    if (relativeOwner !== this.ENNEMY) {
                        console.log('player start, defender start, case is invader, but is not ennemy ??? '
                            + relativeOwner + ' :: ' + owner + ' :: ' + player);
                    }
                }
            } else {
                // TODO
            }
        } else { // player follow
            if (invaderStart) {
                if (case_c === TablutPartSlice.INVADERS) {
                    if (relativeOwner !== this.ENNEMY) {
                        console.log('player follow, invader start, case is invader, but case is not ennemy '
                            + relativeOwner + ' :: ' + owner + ' :: ' + player);
                    }
                }
            } else { // invader follow
                if (case_c === TablutPartSlice.INVADERS) {
                    if (relativeOwner !== this.PLAYER) {
                        console.log('player follow, invader follow, case is invader, but player don\t own it ??? '
                            + relativeOwner + ' :: ' + owner + ' :: ' + player);
                    }
                } else {
                    // TODO
                }
            }
        }
        // FIN DE TESTS
        return relativeOwner;
    }

    static getPossibleDestinations(invaderStart: boolean, depart: Coord, board: number[][]): Coord[] {
        // search the possible destinations for the pawn at "depart"
        const destinations: Coord[] = [];
        let endFound: boolean;
        let foundDestination: Coord;
        for (const dir of ORTHOGONALES) {
            // we look for empty existing destinations in each direction as far as we can
            foundDestination = depart;
            endFound = false;
            while (!endFound) {
                foundDestination = foundDestination.getNext(dir);
                endFound =
                    !foundDestination.isInRange(this.WIDTH, this.WIDTH) ||
                    this.getAbsoluteOwner(foundDestination, invaderStart, board) !== -1; // TODO: clean : -1 un peu écris en dur, berk?
                if (!endFound) {
                    destinations.push(foundDestination);
                }
            }
        }
        return destinations;
    }

    static getKingCoord(board: number[][]): Coord {
        for (let y = 0; y < this.WIDTH; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                if (this.isKing(board[y][x])) {
                    return new Coord(x, y);
                }
            }
        }
        return null;
    }

    static getInvaderVictoryValue(n: MNode<TablutRules>): number {
        const tablutPartSlice: TablutPartSlice = n.gamePartSlice as TablutPartSlice;
        if (TablutRules.VERBOSE) {
            console.log('invader victory !');
        }
        if (tablutPartSlice.invaderStart) {
            return Number.MIN_SAFE_INTEGER;
        }
        return Number.MAX_SAFE_INTEGER;
    }

    static getDefenderVictoryValue(n: MNode<TablutRules>): number {
        console.log('defender victory !');
        const tablutPartSlice: TablutPartSlice = n.gamePartSlice as TablutPartSlice;
        if (tablutPartSlice.invaderStart) {
            return Number.MAX_SAFE_INTEGER;
        }
        return Number.MIN_SAFE_INTEGER;
    }

    static isPlayerImmobilised(player: 0|1, invaderStart: boolean, board: number[][]) {
        return this.getPlayerListMoves(
            player,
            invaderStart,
            board).length === 0;
    }

    static getPlayerListPawns(player: 0|1, invaderStart: boolean, board: number[][]): Coord[] {
        const listPawn: Coord[] = [];
        let pawn: Coord;
        let owner: number;
        for (let y = 0; y < this.WIDTH; y++) {
            for (let x = 0; x < this.WIDTH; x++) {
                // pour chaque case
                pawn = new Coord(x, y);
                owner = this.getRelativeOwner(player, invaderStart, pawn, board);
                if (owner === this.PLAYER) {
                    listPawn.push(pawn);
                }
            }
        }
        return listPawn;
    }

    static getPlayerListMoves(player: 0|1, invaderStart: boolean, board: number[][]): TablutMove[] {
        // player : 0 for the current player
        //          1 for his ennemy
        const localVerbose = false;
        const listMoves: TablutMove[] = [];
        const listPawns: Coord[] = this.getPlayerListPawns(player, invaderStart, board);
        if (localVerbose) {
            console.log('liste des pions ' + listPawns);
        }
        let pawnDestinations: Coord[];
        let newMove: TablutMove;
        for (const pawn of listPawns) {
            pawnDestinations = this.getPossibleDestinations(invaderStart, pawn, board);
            for (const destination of pawnDestinations) {
                newMove = new TablutMove(pawn, destination, []); // TODO: verify correctness of []
                listMoves.push(newMove);
            }
        }
        return listMoves;
    }

    // instance methods :

    getListMoves(n: MNode<TablutRules>): MGPMap<TablutMove, TablutPartSlice> {
        const localVerbose = false;
        if (TablutRules.VERBOSE || localVerbose) {
            console.log('get list move available to ');
            console.log(n);
        }
        const listCombinaison: MGPMap<TablutMove, TablutPartSlice> = new MGPMap<TablutMove, TablutPartSlice>();

        const currentPartSlice: TablutPartSlice = n.gamePartSlice as TablutPartSlice;

        const currentTurn: number = currentPartSlice.turn;
        let currentBoard: number[][] = currentPartSlice.getCopiedBoard();
        const currentPlayer: 0|1 = currentTurn % 2 === 0 ? 0 : 1;
        const invaderStart: boolean = currentPartSlice.invaderStart;

        const listMoves: TablutMove[] =
            TablutRules.getPlayerListMoves(currentPlayer, invaderStart, currentBoard);
        if (TablutRules.VERBOSE || localVerbose) {
            console.log('liste des mouvements : ' + listMoves);
        }
        const nextTurn: number = currentTurn + 1;

        let newPartSlice: TablutPartSlice;
        let moveResult: number;
        for (const newMove of listMoves)    {
            currentBoard = currentPartSlice.getCopiedBoard();
            moveResult = TablutRules.tryMove(currentPlayer, invaderStart, newMove, currentBoard).success;
            if (moveResult === TablutRules.SUCCESS) {
                newPartSlice = new TablutPartSlice(currentBoard, nextTurn, currentPartSlice.invaderStart);
                listCombinaison.put(newMove, newPartSlice);
            } else if (TablutRules.VERBOSE || localVerbose) {
                console.log('how is it that I receive a moveResult == to '
                    + moveResult + ' with ' + newMove + ' at turn ' + currentTurn + ' of player ' + currentPlayer);
            }
        }
        return listCombinaison;
    }

    getListMovesPeared(n: MNode<TablutRules>): { key: TablutMove, value: TablutPartSlice }[] {
        // TODO: pear this method, make it smarter
        const currentPartSlice: TablutPartSlice = n.gamePartSlice as TablutPartSlice;
        const currentBoard: number[][] = currentPartSlice.getCopiedBoard();
        const currentTurn: number = currentPartSlice.turn;
        const invaderStart: boolean = currentPartSlice.invaderStart;
        let coord: Coord;
        let owner: number;
        const currentPlayer: 0|1 = (currentTurn % 2 === 0) ? 0 : 1;
        for (let y = 0; y < TablutRules.WIDTH; y++) {
            for (let x = 0; x < TablutRules.WIDTH; x++) {
                // pour chaque case
                coord = new Coord(x, y);
                owner = TablutRules.getRelativeOwner(currentPlayer, invaderStart, coord, currentBoard);
                if (owner === TablutRules.PLAYER) {
                    // pour l'envahisseur :
                    //     if the king is capturable : the only choice is the capturing
                    //     if the king is close to escape:  the only choice are the blocking one
                    // pour les défenseurs :
                    //     if the king can win : the only choice is the winning
                    //     if king threatened : the only choice is to save him
                    //         a: by escape
                    //         b: by interceding
                    //         c: by killing the threatener
                }
            }
        }
        return null;
    }

    getBoardValue(n: MNode<TablutRules>): number {

        // 1. is the king escaped ?
        // 2. is the king captured ?
        // 3. is one player immobilised ?
        // 4. let's just for now just count the pawns
        const tablutPartSlice: TablutPartSlice = n.gamePartSlice as TablutPartSlice;
        const board: number[][] = tablutPartSlice.getCopiedBoard();
        const invaderStart: boolean = tablutPartSlice.invaderStart;

        const kingCoord: Coord = TablutRules.getKingCoord(board);
        if (kingCoord == null) { // the king is dead, long live the king
            return TablutRules.getInvaderVictoryValue(n);
        }
        if (TablutRules.isExternalThrone(kingCoord)) {
            // king reached one corner !
            console.log('king reached the corner ' + kingCoord);
            return TablutRules.getDefenderVictoryValue(n);
        }
        if (TablutRules.isPlayerImmobilised(0, invaderStart, board)) {
            return Number.MIN_SAFE_INTEGER;
        }
        if (TablutRules.isPlayerImmobilised(1, invaderStart, board)) {
            return Number.MAX_SAFE_INTEGER;
        }
        const nbPlayerZeroPawns = TablutRules.getPlayerListPawns(0, invaderStart, board).length;
        const nbPlayerOnePawns = TablutRules.getPlayerListPawns(1, invaderStart, board).length;
        const zeroMult = invaderStart ? 1 : 2; // invaders pawn are twice as numerous
        const oneMult = invaderStart ? 2 : 1; // so they're twice less valuable
        const scoreZero = nbPlayerZeroPawns * zeroMult;
        const scoreOne = nbPlayerOnePawns * oneMult;
        return scoreZero - scoreOne; // TODO : countInvader vs Defenders
    }

    choose(move: TablutMove): boolean {
        // recherche
        let son: MNode<TablutRules>;
        /* if (this.node.hasMoves()) { // if calculation has already been done by the AI
            console.log(this.node.myToString() + ' at turn ' + this.node.gamePartSlice.turn + ' has ' + this.node.countDescendants() + ' moves');
            son = this.node.getSonByMove(move); // let's not doing if twice
            if (son !== null) {
                console.log('recalculation spared!');
                this.node.keepOnlyChoosenChild(son);
                this.node = son; // qui devient le plateau actuel
                return true;
            }
        } */

        // copies
        const partSlice = this.node.gamePartSlice as TablutPartSlice;
        const board: number[][] = partSlice.getCopiedBoard();
        const turn: number = partSlice.turn;
        const invaderStart: boolean = partSlice.invaderStart;

        // test
        const player: 0|1 = turn % 2 === 0 ? 0 : 1;
        const attemptResult: number = TablutRules.tryMove(player, invaderStart, move, board).success;
        if (TablutRules.VERBOSE) {
            console.log('attemptResult for tablut rules choosing '
                + move + ' : ' + attemptResult + ' at turn : ' + turn + ' of player ' + player); }
        if (attemptResult !== TablutRules.SUCCESS) {
            return false;
        }
        const newPartSlice = new TablutPartSlice(board, turn + 1, invaderStart);
        son = new MNode<TablutRules>(this.node, move, newPartSlice);
        this.node.keepOnlyChoosenChild(son);
        this.node = son;
        return true;
    }

    isLegal(move: TablutMove): boolean {
        // copies
        const partSlice: TablutPartSlice = this.node.gamePartSlice as TablutPartSlice;
        const board: number[][] = partSlice.getCopiedBoard();
        const turn: number = partSlice.turn;
        const invaderStart: boolean = partSlice.invaderStart;

        // test
        const player: 0|1 = turn % 2 === 0 ? 0 : 1;
        return TablutRules.tryMove(player, invaderStart, move, board).success === TablutRules.SUCCESS;
    }

    setInitialBoard() {
        if (this.node == null) {
            this.node = MNode.getFirstNode(
                new TablutPartSlice(TablutPartSlice.getStartingBoard(true), 0, true), // TODO: rendre ça configurable
                this
            );
        } else {
            this.node = this.node.getInitialNode();
        }
    }
}