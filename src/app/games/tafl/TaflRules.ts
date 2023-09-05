import { Orthogonal, Direction } from '../../jscaip/Direction';
import { Rules } from '../../jscaip/Rules';
import { Coord } from '../../jscaip/Coord';
import { TaflMove } from './TaflMove';
import { Player, PlayerOrNone } from 'src/app/jscaip/Player';
import { TaflPawn } from './TaflPawn';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { Debug, Utils } from 'src/app/utils/utils';
import { MGPValidation } from 'src/app/utils/MGPValidation';
import { RelativePlayer } from 'src/app/jscaip/RelativePlayer';
import { RulesFailure } from 'src/app/jscaip/RulesFailure';
import { TaflFailure } from './TaflFailure';
import { TaflConfig } from './TaflConfig';
import { Type } from '@angular/core';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { TaflState } from './TaflState';
import { GameStatus } from 'src/app/jscaip/GameStatus';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { tablutConfig } from './tablut/tablutConfig';

class TaflNode extends MGPNode<TaflRules<TaflMove, TaflState>, TaflMove, TaflState, TaflConfig> {}

export abstract class TaflRules<M extends TaflMove, S extends TaflState> extends Rules<M, S, TaflConfig> {

    protected constructor(stateType: Type<S>,
                          config: TaflConfig,
                          public generateMove: (start: Coord, end: Coord) => MGPFallible<M>)
    {
        super(stateType, config);
        Utils.assert(Object.keys(this.config).length > 0, 'CONFIG CANNOT BE NULL (' + Object.keys(tablutConfig).length +')');
    }
    public isLegal(move: TaflMove, state: S): MGPValidation {
        Utils.assert(Object.keys(this.config).length > 0, 'CONFIG CANNOT BE NULL (' + Object.keys(tablutConfig).length +')');

        const player: Player = state.getCurrentPlayer();
        const validity: MGPValidation = this.getMoveValidity(player, move, state);
        if (validity.isFailure()) {
            return MGPValidation.failure(validity.getReason());
        }
        return MGPValidation.SUCCESS;
    }
    private getMoveValidity(player: Player, move: TaflMove, state: S): MGPValidation {
        const owner: RelativePlayer = state.getRelativeOwner(player, move.getStart());
        if (owner === RelativePlayer.NONE) {
            return MGPValidation.failure(RulesFailure.MUST_CHOOSE_PLAYER_PIECE());
        }
        if (owner === RelativePlayer.OPPONENT) {
            return MGPValidation.failure(RulesFailure.CANNOT_CHOOSE_OPPONENT_PIECE());
        }
        const landingCoordOwner: RelativePlayer = state.getRelativeOwner(player, move.getEnd());
        if (landingCoordOwner !== RelativePlayer.NONE) {
            return MGPValidation.failure(TaflFailure.LANDING_ON_OCCUPIED_SQUARE());
        }
        if (this.isThrone(state, move.getEnd())) {
            if (state.getPieceAt(move.getStart()).isKing()) {
                if (state.isCentralThrone(move.getEnd()) && this.config.CASTLE_IS_LEFT_FOR_GOOD) {
                    return MGPValidation.failure(TaflFailure.THRONE_IS_LEFT_FOR_GOOD());
                }
            } else {
                return MGPValidation.failure(TaflFailure.SOLDIERS_CANNOT_SIT_ON_THRONE());
            }
        }
        const dir: Direction = move.getStart().getDirectionToward(move.getEnd()).get();
        const dist: number = move.getStart().getOrthogonalDistance(move.getEnd());
        let inspectedCoord: Coord = move.getStart().getNext(dir);
        for (let i: number = 1; i < dist; i++) {
            if (state.getPieceAt(inspectedCoord) !== TaflPawn.UNOCCUPIED) {
                return MGPValidation.failure(RulesFailure.SOMETHING_IN_THE_WAY());
            }
            inspectedCoord = inspectedCoord.getNext(dir);
        }
        return MGPValidation.SUCCESS;
    }
    public isThrone(state: S, coord: Coord): boolean {
        if (this.isExternalThrone(state, coord)) {
            return true;
        } else {
            return state.isCentralThrone(coord);
        }
    }
    public isExternalThrone(state: TaflState, coord: Coord): boolean {
        const max: number = state.getSize() - 1;
        if (coord.x === 0) {
            return (coord.y === 0) || (coord.y === max);
        } else if (coord.x === max) {
            return (coord.y === 0) || (coord.y === max);
        }
        return false;
    }
    public tryCapture(player: Player, landingPawn: Coord, d: Orthogonal, state: S): MGPOptional<Coord> {
        /* landingPawn is the piece that just moved
         * d the direction in witch we look for capture
         * return the captured coord, or null if no capture possible
         * 1. the threatened square doesn't exist      -> no capture
         * 2: the threatened square is not an opponent -> no capture
         * 3: the threatened square is a king          -> delegate calculation
         * 4: the threatened square is a pawn          -> delegate calculation
         */
        const threatened: Coord = landingPawn.getNext(d);
        if (state.isOnBoard(threatened) === false) {
            return MGPOptional.empty(); // 1: the threatened square dont exist, no capture
        }
        const threatenedPawnOwner: RelativePlayer = state.getRelativeOwner(player, threatened);
        if (threatenedPawnOwner !== RelativePlayer.OPPONENT) {
            return MGPOptional.empty(); // 2: the threatened square is not an opponent
        }
        if (state.getPieceAt(threatened).isKing()) {
            return this.captureKing(player, landingPawn, d, state);
        }
        return this.capturePawn(player, landingPawn, d, state);
    }
    private captureKing(player: Player, landingPiece: Coord, d: Orthogonal, state: S): MGPOptional<Coord> {
        const kingCoord: Coord = landingPiece.getNext(d);

        const {
            backCoord, back, backInRange,
            left, leftCoord,
            right, rightCoord,
        } = this.getSurroundings(kingCoord, d, player, state);

        if (backInRange === false) {
            return this.captureKingAgainstTheWall(left, right, kingCoord);
        }
        if (back === RelativePlayer.NONE && this.isThrone(state, backCoord)) {
            return this.captureKingAgainstThrone(state, backCoord, kingCoord, left, right);
        }
        if (back === RelativePlayer.PLAYER) {
            return this.captureKingWithAtLeastASandwich(state, kingCoord, left, leftCoord, right, rightCoord);
        }
        return MGPOptional.empty();
    }
    public getSurroundings(c: Coord, d: Orthogonal, player: Player, state: S)
    : { backCoord: Coord, back: RelativePlayer, backInRange: boolean,
        leftCoord: Coord, left: RelativePlayer,
        rightCoord: Coord, right: RelativePlayer }
    {
        // the piece that just moved came from the front direction (by definition)
        const backCoord: Coord = c.getNext(d);
        const backInRange: boolean = state.isOnBoard(backCoord);
        const back: RelativePlayer = backInRange ?
            state.getRelativeOwner(player, backCoord) :
            RelativePlayer.NONE;

        const leftCoord: Coord = c.getLeft(d);
        const leftInRange: boolean = state.isOnBoard(leftCoord);
        const left: RelativePlayer = leftInRange ?
            state.getRelativeOwner(player, leftCoord) :
            RelativePlayer.NONE;

        const rightCoord: Coord = c.getRight(d);
        const rightInRange: boolean = state.isOnBoard(rightCoord);
        const right: RelativePlayer = rightInRange ?
            state.getRelativeOwner(player, rightCoord) :
            RelativePlayer.NONE;
        return {
            backCoord, back, backInRange,
            leftCoord, left,
            rightCoord, right,
        };
    }
    private captureKingAgainstTheWall(left: RelativePlayer,
                                      right: RelativePlayer,
                                      kingCoord: Coord)
    : MGPOptional<Coord>
    {
        let nbInvaders: number = (left === RelativePlayer.PLAYER ? 1 : 0);
        nbInvaders += (right === RelativePlayer.PLAYER ? 1 : 0);
        if (nbInvaders === 2 && this.config.BORDER_CAN_SURROUND_KING) { // 2
            // king captured by 3 invaders against 1 border
            return MGPOptional.of(kingCoord);
        }
        // those were the only two way to capture against the border
        return MGPOptional.empty();
    }
    private captureKingAgainstThrone(state: TaflState,
                                     backCoord: Coord,
                                     kingCoord: Coord,
                                     left: RelativePlayer,
                                     right: RelativePlayer)
    : MGPOptional<Coord>
    {
        if (this.isExternalThrone(state, backCoord)) {
            if (this.config.KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_SANDWICHED) {
                return MGPOptional.of(kingCoord);
            }
        } else { // Central throne
            const kingHasOpponentOnItsLeft: boolean = left === RelativePlayer.PLAYER;
            const kingHasOpponentOnItsRight: boolean = right === RelativePlayer.PLAYER;
            const kingHasThreeOpponentAround: boolean = kingHasOpponentOnItsLeft || kingHasOpponentOnItsRight;
            if (this.config.CENTRAL_THRONE_CAN_SURROUND_KING && kingHasThreeOpponentAround) {
                return MGPOptional.of(kingCoord);
            }
        }
        return MGPOptional.empty();
    }
    private capturePawn(player: Player, coord: Coord, direction: Orthogonal, state: S): MGPOptional<Coord> {
        /**
         * the captured pawn is on the next coord after 'coord' (in direction 'direction')
         * coord partipate in the capture
         *
         * So these are the different capture ways :
         * - 2 opponents
         * - 1 opponents 1 empty-throne
         */
        const threatenedPieceCoord: Coord = coord.getNext(direction);

        const backCoord: Coord = threatenedPieceCoord.getNext(direction);
        // the piece that just move is always considered in front
        let back: RelativePlayer = RelativePlayer.NONE;
        if (state.isOnBoard(backCoord)) {
            back = state.getRelativeOwner(player, backCoord);
        }
        if (back === RelativePlayer.NONE) {
            if (this.isThrone(state, backCoord) === false) {
                Debug.display('TaflRules', 'capturePawn',
                              'cannot capture a pawn without an ally; ' +
                              threatenedPieceCoord + 'threatened by ' + player + `'s pawn in ` + coord +
                              ' coming from this direction (' + direction.x + ', ' + direction.y + ')' +
                              'cannot capture a pawn without an ally behind');
                return MGPOptional.empty();
            } // here, back is an empty throne
            Debug.display('TaflRules', 'capturePawn',
                          'pawn captured by 1 opponent and 1 throne; ' +
                          threatenedPieceCoord + 'threatened by ' + player + `'s pawn in ` + coord +
                          ' coming from this direction (' + direction.x + ', ' + direction.y + ')');
            return MGPOptional.of(threatenedPieceCoord); // pawn captured by 1 opponent and 1 throne
        }
        if (back === RelativePlayer.PLAYER) {
            Debug.display('TaflRules', 'capturePawn',
                          'pawn captured by 2 opponents; ' + threatenedPieceCoord +
                          'threatened by ' + player + `'s pawn in ` + coord +
                          ' coming from this direction (' + direction.x + ', ' + direction.y + ')');
            return MGPOptional.of(threatenedPieceCoord); // pawn captured by two opponents
        }
        Debug.display('TaflRules', 'capturePawn',
                      'no captures; ' + threatenedPieceCoord + 'threatened by ' + player + `'s pawn in ` + coord +
                      ' coming from this direction (' + direction.x + ', ' + direction.y + ')');
        return MGPOptional.empty();
    }
    private captureKingWithAtLeastASandwich(state: S,
                                            kingCoord: Coord,
                                            left: RelativePlayer,
                                            leftCoord: Coord,
                                            right: RelativePlayer,
                                            rightCoord: Coord)
    : MGPOptional<Coord>
    {
        if (this.kingTouchCentralThrone(state, kingCoord) === false &&
            this.config.KING_FAR_FROM_CENTRAL_THRONE_CAN_BE_SANDWICHED)
        {
            return MGPOptional.of(kingCoord);
        }
        const throneCanSurrond: boolean = this.config.CENTRAL_THRONE_CAN_SURROUND_KING;
        const leftIsThrone: boolean = this.isThrone(state, leftCoord);
        const leftCanSurround: boolean = left === RelativePlayer.PLAYER || (leftIsThrone && throneCanSurrond);
        const rightIsThrone: boolean = this.isThrone(state, rightCoord);
        const rightCanSurround: boolean = right === RelativePlayer.PLAYER || (rightIsThrone && throneCanSurrond);
        if (leftCanSurround && rightCanSurround) {
            return MGPOptional.of(kingCoord); // king captured by 4 invaders
        }
        return MGPOptional.empty();
    }
    private kingTouchCentralThrone(state: S, kingCoord: Coord): boolean {
        const centralThrone: Coord = state.getCentralThrone();
        return kingCoord.getOrthogonalDistance(centralThrone) <= 1;
    }
    public applyLegalMove(move: TaflMove, state: S, _info: void): S {
        const turn: number = state.turn;

        const board: TaflPawn[][] = state.getCopiedBoard();
        const player: Player = state.getCurrentPlayer();
        const start: Coord = move.getStart();
        const end: Coord = move.getEnd();
        board[end.y][end.x] = board[start.y][start.x]; // move the piece to the new position
        board[start.y][start.x] = TaflPawn.UNOCCUPIED; // remove it from the previous position
        for (const d of Orthogonal.ORTHOGONALS) {
            const captured: MGPOptional<Coord> = this.tryCapture(player, move.getEnd(), d, state);
            if (captured.isPresent()) {
                board[captured.get().y][captured.get().x] = TaflPawn.UNOCCUPIED;
            }
        }
        return state.of(board, turn + 1);
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
        const optionalKingCoord: MGPOptional<Coord> = this.getKingCoord(state);
        if (optionalKingCoord.isAbsent()) {
            Debug.display('TaflRules', 'getWinner', 'The king is dead, victory to invader');
            // the king is dead, long live the king
            return MGPOptional.of(this.getInvader());
        }
        const kingCoord: Coord = optionalKingCoord.get();
        if (this.isExternalThrone(state, kingCoord)) {
            Debug.display('TaflRules', 'getWinner', 'The king escape, victory to defender');
            // king reached one corner!
            return MGPOptional.of(this.getDefender());
        }
        if (this.isPlayerImmobilized(Player.ZERO, state)) {
            Debug.display('TaflRules', 'getWinner', 'Zero has no move, victory to one');
            return MGPOptional.of(Player.ONE);
        }
        if (this.isPlayerImmobilized(Player.ONE, state)) {
            Debug.display('TaflRules', 'getWinner', 'One has no move, victory to zero');
            return MGPOptional.of(Player.ZERO);
        }
        Debug.display('TaflRules', 'getWinner', 'no victory');
        return MGPOptional.empty();
    }
    public getKingCoord(state: S): MGPOptional<Coord> {
        const size: number = state.getSize();
        for (let y: number = 0; y < size; y++) {
            for (let x: number = 0; x < size; x++) {
                if (state.getPieceAtXY(x, y).isKing()) {
                    return MGPOptional.of(new Coord(x, y));
                }
            }
        }
        return MGPOptional.empty();
    }
    public getInvader(): Player {
        return this.config.INVADER_STARTS ? Player.ZERO : Player.ONE;
    }
    public getDefender(): Player {
        return this.getInvader().getOpponent();
    }
    public isPlayerImmobilized(player: Player, state: S): boolean {
        return this.getPlayerListMoves(player, state).length === 0;
    }
    public getPlayerListMoves(player: Player, state: S): M[] {
        const listMoves: M[] = [];
        const listPawns: Coord[] = this.getPlayerListPawns(player, state);

        for (const pawn of listPawns) {
            const pawnDestinations: Coord[] = this.getPossibleDestinations(pawn, state);
            for (const destination of pawnDestinations) {
                const newMove: M = this.generateMove(pawn, destination).get();
                listMoves.push(newMove);
            }
        }
        return listMoves;
    }
    public getPlayerListPawns(player: Player, state: S): Coord[] {
        const size: number = state.getSize();
        const listPawn: Coord[] = [];
        for (let y: number = 0; y < size; y++) {
            for (let x: number = 0; x < size; x++) {
                // for each square
                const pawn: Coord = new Coord(x, y);
                const owner: PlayerOrNone = state.getAbsoluteOwner(pawn);
                if (owner === player) {
                    listPawn.push(pawn);
                }
            }
        }
        return listPawn;
    }
    public getPossibleDestinations(start: Coord, state: S): Coord[] {
        // search the possible destinations for the pawn at "start"
        const destinations: Coord[] = [];
        let foundDestination: Coord;
        for (const dir of Orthogonal.ORTHOGONALS) {
            // we look for empty existing destinations in each direction as far as we can
            foundDestination = start.getNext(dir, 1);
            let obstacleFound: boolean = false;
            while (state.isOnBoard(foundDestination) && obstacleFound === false) {
                const destinationEmpty: boolean = state.getAbsoluteOwner(foundDestination) === PlayerOrNone.NONE;
                if (destinationEmpty) {
                    if (this.isExternalThrone(state, foundDestination)) {
                        if (state.getPieceAt(start).isKing()) {
                            destinations.push(foundDestination);
                        }
                    } else if (state.isCentralThrone(foundDestination)) {
                        if (state.getPieceAt(start).isKing() &&
                            this.config.CASTLE_IS_LEFT_FOR_GOOD === false)
                        {
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
}
