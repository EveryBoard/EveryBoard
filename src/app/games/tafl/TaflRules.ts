import { Orthogonal, Direction } from '../../jscaip/Direction';
import { GameStatus, Rules } from '../../jscaip/Rules';
import { Coord } from '../../jscaip/Coord';
import { TaflMove } from './TaflMove';
import { Player } from 'src/app/jscaip/Player';
import { TaflPawn } from './TaflPawn';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { assert, display } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflLegalityStatus } from './TaflLegalityStatus';
import { RelativePlayer } from 'src/app/jscaip/RelativePlayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { TaflFailure } from './TaflFailure';
import { TaflConfig } from './TaflConfig';
import { Type } from '@angular/core';
import { GameStateWithTable } from 'src/app/jscaip/GameStateWithTable';
import { MGPNode } from 'src/app/jscaip/MGPNode';

export abstract class TaflState extends GameStateWithTable<TaflPawn> {

    public abstract from(board: Table<TaflPawn>, turn: number): this;

    public abstract isCentralThrone(c: Coord): boolean;
}
class TaflNode extends MGPNode<TaflRules<TaflMove, TaflState>, TaflMove, TaflState, TaflLegalityStatus> {}

export abstract class TaflRules<M extends TaflMove, S extends TaflState> extends Rules<M, S, TaflLegalityStatus> {

    public static VERBOSE: boolean = false;

    protected constructor(stateType: Type<S>,
                          public readonly config: TaflConfig,
                          public moveGenerator: (start: Coord, end: Coord) => M)
    {
        super(stateType);
    }
    public isLegal(move: TaflMove, state: S): TaflLegalityStatus {
        display(TaflRules.VERBOSE, { tablutRules_isLegal: { move, state } });
        // copies
        const board: TaflPawn[][] = state.getCopiedBoard();

        // test
        const player: Player = state.getCurrentPlayer();
        const validity: MGPValidation = this.getMoveValidity(player, move, state);
        if (validity.isFailure()) {
            return { legal: validity, resultingBoard: null };
        }

        // move is legal here
        const depart: Coord = move.coord;
        const arrival: Coord = move.end;
        board[arrival.y][arrival.x] = board[depart.y][depart.x]; // move the piece to the new position
        board[depart.y][depart.x] = TaflPawn.UNOCCUPIED; // remove it from the previous position
        let captured: Coord;
        for (const d of Orthogonal.ORTHOGONALS) {
            captured = this.tryCapture(player, move.end, d, state);
            if (captured != null) {
                board[captured.y][captured.x] = TaflPawn.UNOCCUPIED; // do capture, unless if king
            }
        }
        return { legal: MGPValidation.SUCCESS, resultingBoard: board };
    }
    private getMoveValidity(player: Player, move: TaflMove, state: S): MGPValidation {
        const cOwner: RelativePlayer = this.getRelativeOwner(player, move.coord, state.board);
        if (cOwner === RelativePlayer.NONE) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        if (cOwner === RelativePlayer.OPPONENT) {
            return MGPValidation.failure(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }

        const landingCoordOwner: RelativePlayer = this.getRelativeOwner(player, move.end, state.board);
        if (landingCoordOwner !== RelativePlayer.NONE) {
            return MGPValidation.failure(TaflFailure.LANDING_ON_OCCUPIED_CASE());
        }
        if (this.isThrone(state, move.end)) {
            if (state.board[move.coord.y][move.coord.x].isKing()) {
                if (state.isCentralThrone(move.end) && this.config.CASTLE_IS_LEFT_FOR_GOOD) {
                    return MGPValidation.failure(TaflFailure.THRONE_IS_LEFT_FOR_GOOD());
                }
            } else {
                return MGPValidation.failure(TaflFailure.SOLDIERS_CANNOT_SIT_ON_THRONE());
            }
        }

        const dir: Direction = move.coord.getDirectionToward(move.end).get();

        const dist: number = move.coord.getOrthogonalDistance(move.end);
        let c: Coord = move.coord.getNext(dir); // the inspected coord
        for (let i: number = 1; i < dist; i++) {
            if (state.board[c.y][c.x] !== TaflPawn.UNOCCUPIED) {
                return MGPValidation.failure(TaflFailure.SOMETHING_IN_THE_WAY());
            }
            c = c.getNext(dir);
        }
        return MGPValidation.SUCCESS;
    }
    public getRelativeOwner(player: Player, c: Coord, board: Table<TaflPawn>): RelativePlayer {
        const caseC: TaflPawn = board[c.y][c.x];
        const owner: Player = this.getAbsoluteOwner(c, board);
        let relativeOwner: RelativePlayer;
        if (owner === Player.NONE) {
            relativeOwner = RelativePlayer.NONE;
        } else if (player === owner) {
            relativeOwner = RelativePlayer.PLAYER;
        } else {
            relativeOwner = RelativePlayer.OPPONENT;
        }
        // TESTS
        if (caseC === TaflPawn.UNOCCUPIED) {
            if (relativeOwner !== RelativePlayer.NONE) {
                display(TaflRules.VERBOSE,
                        'WTF, empty is on no one side but here is on ' +
                        relativeOwner + ' :: ' + owner + ' :: ' + player);
            }
        } else if (player === Player.ZERO) {
            if (caseC === TaflPawn.INVADERS) {
                if (this.config.INVADER === Player.ZERO) {
                    if (relativeOwner !== RelativePlayer.PLAYER) {
                        display(TaflRules.VERBOSE,
                                `player start, invader start, case is invader, but player don't own the case ` +
                                relativeOwner + ' :: ' + owner + ' :: ' + player);
                    }
                } else {
                    if (relativeOwner !== RelativePlayer.OPPONENT) {
                        display(TaflRules.VERBOSE,
                                'player start, defender start, case is invader, but is not opponent ??? ' +
                                relativeOwner + ' :: ' + owner + ' :: ' + player);
                    }
                }
            } else {
                // TODO
            }
        } else { // player follow
            if (this.config.INVADER === Player.ZERO) {
                if (caseC === TaflPawn.INVADERS) {
                    if (relativeOwner !== RelativePlayer.OPPONENT) {
                        display(TaflRules.VERBOSE,
                                'player follow, invader start, case is invader, but case is not opponent ' +
                            relativeOwner + ' :: ' + owner + ' :: ' + player);
                    }
                }
            } else { // invader follow
                if (caseC === TaflPawn.INVADERS) {
                    if (relativeOwner !== RelativePlayer.PLAYER) {
                        display(TaflRules.VERBOSE,
                                'player follow, invader follow, case is invader, but player don\t own it ??? ' +
                            relativeOwner + ' :: ' + owner + ' :: ' + player);
                    }
                } else {
                    // TODO
                }
            }
        }
        // FIN DE TESTS
        return relativeOwner;
    }
    public getAbsoluteOwner(c: Coord, board: Table<TaflPawn>): Player {
        const caseC: TaflPawn = board[c.y][c.x];
        let owner: Player;
        switch (caseC) {
            case TaflPawn.PLAYER_ZERO_KING:
                owner = Player.ZERO;
                break;
            case TaflPawn.PLAYER_ONE_KING:
                owner = Player.ONE;
                break;
            case TaflPawn.INVADERS:
                owner = this.config.INVADER;
                break;
            case TaflPawn.DEFENDERS:
                owner = this.config.INVADER.getOpponent();
                break;
            default:
                assert(caseC === TaflPawn.UNOCCUPIED, 'Invalid value on the board: ' + caseC);
                owner = Player.NONE;
                break;
        }
        return owner;
    }
    public isThrone(state: S, c: Coord): boolean {
        if (this.isExternalThrone(c)) {
            return true;
        } else {
            return state.isCentralThrone(c);
        }
    }
    public isExternalThrone(c: Coord): boolean {
        const fin: number = this.config.WIDTH - 1;
        if (c.x === 0) {
            return (c.y === 0) || (c.y === fin);
        } else if (c.x === fin) {
            return (c.y === 0) || (c.y === fin);
        }
        return false;
    }
    public tryCapture(player: Player, landingPawn: Coord, d: Orthogonal, state: S): Coord {
        /* landingPawn is the piece that just moved
         * d the direction in witch we look for capture
         * return the captured coord, or null if no capture possible
         * 1. the threatened case dont exist         -> no capture
         * 2: the threatened case is not an opponent -> no capture
         * 3: the threatened case is a king -> delegate calculation
         * 4: the threatened case is a pawn -> delegate calculation
         */
        const threatened: Coord = landingPawn.getNext(d);
        if (!threatened.isInRange(this.config.WIDTH, this.config.WIDTH)) {
            return null; // 1: the threatened case dont exist, no capture
        }
        const threatenedPawnOwner: RelativePlayer = this.getRelativeOwner(player, threatened, state.board);
        if (threatenedPawnOwner !== RelativePlayer.OPPONENT) {
            return null; // 2: the threatened case is not an opponent
        }
        if (state.board[threatened.y][threatened.x].isKing()) {
            return this.captureKing(player, landingPawn, d, state);
        }
        return this.capturePawn(player, landingPawn, d, state);
    }
    private captureKing(player: Player,
                        landingPiece: Coord,
                        d: Orthogonal,
                        state: S)
    : Coord
    {
        /**
         * the king is the next coord after c (in direction d)
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
        const LOCAL_VERBOSE: boolean = false;
        const kingCoord: Coord = landingPiece.getNext(d);

        const {
            backCoord, back, backInRange,
            leftCoord, left,
            rightCoord, right,
        } = this.getSurroundings(kingCoord, d, player, state.board);

        if (!backInRange) { // //////////////////////////////////////////////////////////////////////////// 1
            return this.captureKingAgainstTheWall(left, leftCoord, right, rightCoord, kingCoord, state); // 2, 3
        }
        if (back === RelativePlayer.NONE) { // //////////////////////////////////////////////////////////// 4
            if (this.isThrone(state, backCoord) === false) { // /////////////////////////////////////////// 5
                return null;
            } // here, back is an empty throne
            if (this.config.KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_CAPTURED_NORMALLY) {
                return kingCoord;
            }
            if (this.config.CAPTURE_KING_AGAINST_THRONE_RULES === false) { // ///////////////////////////// 6
                return null;
            } // here king is capturable by this empty throne
            if (this.config.NORMAL_CAPTURE_WORK_ON_THE_KING) { // ///////////////////////////////////////// 7
                display(TaflRules.VERBOSE || LOCAL_VERBOSE, 'king captured by 1 invader and 1 throne');
                return kingCoord; // king captured by 1 invader and 1 throne
            }
            if (left === RelativePlayer.PLAYER && right === RelativePlayer.PLAYER) {
                display(TaflRules.VERBOSE || LOCAL_VERBOSE, 'king captured by 3 invaders + 1 throne');
                return kingCoord; // king captured by 3 invaders + 1 throne
            }
        }
        if (back === RelativePlayer.PLAYER) {
            return this.captureKingWithAtLeastASandwhich(state, kingCoord, left, leftCoord, right, rightCoord);
        }
        return null;
    }
    public getSurroundings(c: Coord, d: Orthogonal, player: Player, board: Table<TaflPawn>)
    : { backCoord: Coord, back: RelativePlayer, backInRange: boolean,
        leftCoord: Coord, left: RelativePlayer,
        rightCoord: Coord, right: RelativePlayer }
    {
        const backCoord: Coord = c.getNext(d); // the piece that just move came from the front direction (by definition)
        const backInRange: boolean = backCoord.isInRange(this.config.WIDTH, this.config.WIDTH);
        const back: RelativePlayer = backInRange ?
            this.getRelativeOwner(player, backCoord, board) :
            RelativePlayer.NONE;

        const leftCoord: Coord = c.getLeft(d);
        const leftInRange: boolean = leftCoord.isInRange(this.config.WIDTH, this.config.WIDTH);
        const left: RelativePlayer = leftInRange ?
            this.getRelativeOwner(player, leftCoord, board) :
            RelativePlayer.NONE;

        const rightCoord: Coord = c.getRight(d);
        const rightInRange: boolean = rightCoord.isInRange(this.config.WIDTH, this.config.WIDTH);
        const right: RelativePlayer = rightInRange ?
            this.getRelativeOwner(player, rightCoord, board) :
            RelativePlayer.NONE;
        return {
            backCoord, back, backInRange,
            leftCoord, left,
            rightCoord, right,
        };
    }
    private captureKingAgainstTheWall(left: RelativePlayer,
                                      leftCoord: Coord,
                                      right: RelativePlayer,
                                      rightCoord: Coord,
                                      kingCoord: Coord,
                                      state: S)
    : Coord
    {
        const LOCAL_VERBOSE: boolean = false;
        let nbInvaders: number = (left === RelativePlayer.PLAYER ? 1 : 0);
        nbInvaders += (right === RelativePlayer.PLAYER ? 1 : 0);
        if (nbInvaders === 2 && this.config.THREE_INVADERS_AND_A_BORDER_CAN_CAPTURE_KING) { // 2
            // king captured by 3 invaders against 1 border
            display(TaflRules.VERBOSE || LOCAL_VERBOSE, 'king captured by 3 invaders against 1 border');
            return kingCoord;
        } else if (nbInvaders === 1) {
            if (this.isEmptyThrone(leftCoord, state) ||
                this.isEmptyThrone(rightCoord, state)) {
                if (this.config.CAPTURE_KING_AGAINST_THRONE_RULES) { // ////////////////////// 3
                    // king captured by 1 border, 1 throne, 2 invaders
                    display(TaflRules.VERBOSE || LOCAL_VERBOSE,
                            'king captured by 2 invaders against 1 corner and 1 border');
                    return kingCoord;
                }
            }
        }
        // those were the only two way to capture against the border
        return null;
    }
    private isEmptyThrone(c: Coord, state: S): boolean {
        if (this.isThrone(state, c)) {
            return state.board[c.y][c.x] === TaflPawn.UNOCCUPIED;
        }
        return false;
    }
    private capturePawn(player: Player, c: Coord, d: Orthogonal, state: S): Coord {
        /* the pawn is the next coord after c (in direction d)
         * c partipate in the capture
         *
         * So these are the different capture ways :
         * - 2 opponents
         * - 1 opponents 1 empty-throne
         */
        const LOCAL_VERBOSE: boolean = false;

        const threatenedPieceCoord: Coord = c.getNext(d);

        const backCoord: Coord = threatenedPieceCoord.getNext(d);
        // the piece that just move is always considered in front
        if (!backCoord.isInRange(this.config.WIDTH, this.config.WIDTH)) {
            display(TaflRules.VERBOSE || LOCAL_VERBOSE,
                    'cannot capture a pawn against a wall; ' + threatenedPieceCoord +
                    'threatened by ' + player + `'s pawn in  ` + c +
                    ' coming from this direction (' + d.x + ', ' + d.y + ')');
            return null; // no ally no sandwich (against pawn)
        }

        const back: RelativePlayer = this.getRelativeOwner(player, backCoord, state.board);
        if (back === RelativePlayer.NONE) {
            if (!this.isThrone(state, backCoord)) {
                display(TaflRules.VERBOSE || LOCAL_VERBOSE,
                        'cannot capture a pawn without an ally; ' +
                        threatenedPieceCoord + 'threatened by ' + player + `'s pawn in  ` + c +
                        ' coming from this direction (' + d.x + ', ' + d.y + ')' +
                        'cannot capture a pawn without an ally behind');
                return null;
            } // here, back is an empty throne
            if (this.config.CAPTURE_PAWN_AGAINST_THRONE_RULES) {
                display(TaflRules.VERBOSE || LOCAL_VERBOSE,
                        'pawn captured by 1 opponent and 1 throne; ' +
                        threatenedPieceCoord + 'threatened by ' + player + `'s pawn in  ` + c +
                        ' coming from this direction (' + d.x + ', ' + d.y + ')');
                return threatenedPieceCoord; // pawn captured by 1 opponent and 1 throne
            }
        }
        if (back === RelativePlayer.PLAYER) {
            display(TaflRules.VERBOSE || LOCAL_VERBOSE,
                    'pawn captured by 2 opponents; ' + threatenedPieceCoord +
                    'threatened by ' + player + `'s pawn in  ` + c +
                    ' coming from this direction (' + d.x + ', ' + d.y + ')');
            return threatenedPieceCoord; // pawn captured by two opponents
        }
        display(TaflRules.VERBOSE || LOCAL_VERBOSE,
                'no captures; ' + threatenedPieceCoord + 'threatened by ' + player + `'s pawn in  ` + c +
                ' coming from this direction (' + d.x + ', ' + d.y + ')');
        return null;
    }
    private captureKingWithAtLeastASandwhich(state: S,
                                             kingCoord: Coord,
                                             left: RelativePlayer,
                                             leftCoord: Coord,
                                             right: RelativePlayer,
                                             rightCoord: Coord)
    : Coord
    {
        const LOCAL_VERBOSE: boolean = false;
        if (this.config.NORMAL_CAPTURE_WORK_ON_THE_KING) {
            display(TaflRules.VERBOSE || LOCAL_VERBOSE, 'king captured by two invaders');
            return kingCoord; // king captured by two invaders
        }
        const kingHasThroneOnItsLeft: boolean = left === RelativePlayer.NONE &&
                                                state.isCentralThrone(leftCoord);
        const kingHasThroneOnItsRight: boolean = right === RelativePlayer.NONE &&
                                                 state.isCentralThrone(rightCoord);
        const kingTouchCentralThrone: boolean = kingHasThroneOnItsLeft || kingHasThroneOnItsRight;
        if (kingTouchCentralThrone === false && this.config.KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_CAPTURED_NORMALLY) {
            return kingCoord;
        }
        if (left === RelativePlayer.PLAYER && right === RelativePlayer.PLAYER) {
            display(TaflRules.VERBOSE || LOCAL_VERBOSE, 'king captured by 4 invaders');
            return kingCoord; // king captured by 4 invaders
        }
    }
    public applyLegalMove(move: TaflMove,
                          state: S,
                          status: TaflLegalityStatus)
    : S
    {
        display(TaflRules.VERBOSE, { TablutRules_applyLegalMove: { move, state, status } });
        // copies
        const turn: number = state.turn;

        return state.from(status.resultingBoard, turn + 1);
    }
    public getGameStatus(node: TaflNode): GameStatus {
        const state: S = node.gameState as S;

        const winner: MGPOptional<Player> = this.getWinner(state);
        if (winner.isPresent()) {
            return GameStatus.getVictory(winner.get());
        }
        return GameStatus.ONGOING;
    }
    public getWinner(state: S): MGPOptional<Player> {
        const LOCAL_VERBOSE: boolean = false;
        const optionalKingCoord: MGPOptional<Coord> = this.getKingCoord(state.board);
        if (optionalKingCoord.isAbsent()) {
            display(LOCAL_VERBOSE, 'The king is dead, victory to invader');
            // the king is dead, long live the king
            return MGPOptional.of(this.getInvader());
        }
        const kingCoord: Coord = optionalKingCoord.get();
        if (this.isExternalThrone(kingCoord)) {
            display(LOCAL_VERBOSE, 'The king escape, victory to defender');
            // king reached one corner!
            return MGPOptional.of(this.getDefender());
        }
        if (this.isPlayerImmobilized(Player.ZERO, state)) {
            display(LOCAL_VERBOSE, 'Zero has no move, victory to one');
            return MGPOptional.of(Player.ONE);
        }
        if (this.isPlayerImmobilized(Player.ONE, state)) {
            display(LOCAL_VERBOSE, 'One has no move, victory to zero');
            return MGPOptional.of(Player.ZERO);
        }
        display(LOCAL_VERBOSE, 'no victory');
        return MGPOptional.empty();
    }
    public getKingCoord(board: Table<TaflPawn>): MGPOptional<Coord> {
        display(TaflRules.VERBOSE, { TablutRules_getKingCoord: { board } });

        for (let y: number = 0; y < this.config.WIDTH; y++) {
            for (let x: number = 0; x < this.config.WIDTH; x++) {
                if (board[y][x].isKing()) {
                    return MGPOptional.of(new Coord(x, y));
                }
            }
        }
        return MGPOptional.empty();
    }
    public getInvader(): Player {
        return this.config.INVADER;
    }
    public getDefender(): Player {
        return this.config.INVADER.getOpponent();
    }
    public isPlayerImmobilized(player: Player, state: S): boolean {
        return this.getPlayerListMoves(player, state).length === 0;
    }
    public getPlayerListMoves(player: Player, state: S): TaflMove[] {
        const LOCAL_VERBOSE: boolean = false;
        const listMoves: TaflMove[] = [];
        const listPawns: Coord[] = this.getPlayerListPawns(player, state.board);
        display(TaflRules.VERBOSE || LOCAL_VERBOSE, { TablutRules_getPlayerListMoves: { player, state } });

        let pawnDestinations: Coord[];
        let newMove: TaflMove;
        for (const pawn of listPawns) {
            pawnDestinations = this.getPossibleDestinations(pawn, state);
            for (const destination of pawnDestinations) {
                newMove = this.moveGenerator(pawn, destination);
                listMoves.push(newMove);
            }
        }
        return listMoves;
    }
    public getPlayerListPawns(player: Player, board: Table<TaflPawn>): Coord[] {
        const listPawn: Coord[] = [];
        let pawn: Coord;
        let owner: Player;
        for (let y: number = 0; y < this.config.WIDTH; y++) {
            for (let x: number = 0; x < this.config.WIDTH; x++) {
                // pour chaque case
                pawn = new Coord(x, y);
                owner = this.getAbsoluteOwner(pawn, board);
                if (owner === player) {
                    listPawn.push(pawn);
                }
            }
        }
        return listPawn;
    }
    public getPossibleDestinations(depart: Coord, state: S): Coord[] {
        // search the possible destinations for the pawn at "depart"
        const destinations: Coord[] = [];
        let foundDestination: Coord;
        for (const dir of Orthogonal.ORTHOGONALS) {
            // we look for empty existing destinations in each direction as far as we can
            foundDestination = depart.getNext(dir, 1);
            let obstacleFound: boolean = false;
            while (foundDestination.isInRange(this.config.WIDTH, this.config.WIDTH) &&
                   obstacleFound === false)
            {
                const destinationEmpty: boolean = this.getAbsoluteOwner(foundDestination, state.board) === Player.NONE;
                if (destinationEmpty) {
                    if (this.isThrone(state, foundDestination)) {
                        if (state.board[depart.y][depart.x].isKing()) {
                            destinations.push(foundDestination);
                        }
                    } else {
                        destinations.push(foundDestination);
                    }
                } else {
                    obstacleFound = true;
                }
                foundDestination = foundDestination.getNext(dir, 1);
            }
        }
        return destinations;
    }
    public getListMovesPruned(node: TaflNode): { key: TaflMove, value: TaflState }[] {
        // TODO: prune this method, make it smarter
        const state: TaflState = node.gameState;
        const currentBoard: Table<TaflPawn> = state.getCopiedBoard();
        let coord: Coord;
        let owner: RelativePlayer;
        const currentPlayer: Player = state.getCurrentPlayer();
        for (let y: number = 0; y < this.config.WIDTH; y++) { // TODOTODO
            for (let x: number = 0; x < this.config.WIDTH; x++) { // TODOTODO
                // for each square
                coord = new Coord(x, y);
                owner = this.getRelativeOwner(currentPlayer, coord, currentBoard);
                if (owner === RelativePlayer.PLAYER) {
                    // for the attacker :
                    //     if the king is capturable : the only choice is the capturing
                    //     if the king is close to escape:  the only choice are the blocking one
                    // for the defender :
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
}
