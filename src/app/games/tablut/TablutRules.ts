import {DIRECTION, ORTHOGONALE, ORTHOGONALES} from '../../jscaip/DIRECTION';
import {Rules} from '../../jscaip/Rules';
import {Coord} from '../../jscaip/Coord';
import {MNode} from '../../jscaip/MNode';
import {TablutPartSlice} from './TablutPartSlice';
import {MoveCoordToCoordAndCapture} from '../../jscaip/MoveCoordToCoordAndCapture';

export class TablutRules extends Rules {

	// statics fields :

	private static i = 42;

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

	static readonly SUCCESS = TablutRules.i++;
	static readonly NOT_IN_RANGE_ERROR = TablutRules.i++;
	static readonly IMMOBILE_MOVE_ERROR = TablutRules.i++;
	static readonly NOT_ORTHOGONAL_ERROR = TablutRules.i++;
	static readonly SOMETHING_IN_THE_WAY_ERROR = TablutRules.i++;
	static readonly PAWN_COORD_UNOCCUPIED_ERROR = TablutRules.i++;
	static readonly MOVING_OPPONENT_PIECE_ERROR = TablutRules.i++;
	static readonly LANDING_ON_OCCUPIED_CASE_ERROR = TablutRules.i++;
	static readonly PAWN_LANDING_ON_THRONE_ERROR = TablutRules.i++;
	static readonly CASTLE_IS_LEFT_FOR_GOOD_ERROR = TablutRules.i++;

	private static readonly NONE = TablutRules.i++;
	private static readonly ENNEMY = TablutRules.i++;
	private static readonly PLAYER = TablutRules.i++;

	// statics methods :

	private static tryMove(turn: number, move: MoveCoordToCoordAndCapture, board: number[][]): number {
		// TODO: shouldn't all Rules have a "tryMove" who modify the move and partSlice parameter and return an integer status
		const errorValue = TablutRules.getMoveValidity(turn, move, board);
		if (errorValue !== TablutRules.SUCCESS) {
			return errorValue;
		}

		// move is legal here
		const captureds: Coord[] = new Coord[3];
		let nbCaptureds = 0;
		let captured: Coord;
		const dir: ORTHOGONALE = move.coord.getOrthogonalDirectionToward(move.end);
		for (const d of ORTHOGONALES) {
			if (!DIRECTION.equals(d, dir)) {
				captured = TablutRules.capture(turn, move.end, d, board);
				if (captured != null) {
					captureds[nbCaptureds++] = captured;
				}
			}
		}
		if (nbCaptureds > 0) {
			const capturedsArray: Coord[] = []; // OLD new ArrayList<Coord>(nbCaptureds);
			for (let i = 0; i < nbCaptureds; i++) {
				capturedsArray.push(captureds[i]);
			}
			move.setCaptures(capturedsArray);
		}
		return TablutRules.SUCCESS;
	}

	private static getMoveValidity(turn: number, move: MoveCoordToCoordAndCapture, board: number[][]): number {
		if (!move.coord.isInRange(TablutRules.WIDTH, TablutRules.WIDTH)) { // TODO: implément height so he leave me be
			return TablutRules.NOT_IN_RANGE_ERROR;
		}
		if (!move.end.isInRange(TablutRules.WIDTH, TablutRules.WIDTH)) {
			return TablutRules.NOT_IN_RANGE_ERROR;
		}

		const player: 0|1 = (turn % 2 === 0) ? 0 : 1;
		const cOwner: number = TablutRules.getOwner(player, move.coord, board);
		if (cOwner === TablutRules.NONE) {
			return TablutRules.PAWN_COORD_UNOCCUPIED_ERROR;
		}
		if (cOwner === TablutRules.ENNEMY) {
			return TablutRules.MOVING_OPPONENT_PIECE_ERROR;
		}

		const landingCoordOwner: number = TablutRules.getOwner(player, move.end, board);
		if (landingCoordOwner !== TablutRules.NONE) {
			return TablutRules.LANDING_ON_OCCUPIED_CASE_ERROR;
		}
		if (TablutRules.isThrone(move.end)) {
			if (TablutRules.isKing(board[move.end.y][move.end.x])) {
				if (TablutRules.isCentralThrone(move.end) && TablutRules.CASTLE_IS_LEFT_FOR_GOOD) {
					return TablutRules.CASTLE_IS_LEFT_FOR_GOOD_ERROR;
				}
			} else {
				return TablutRules.PAWN_LANDING_ON_THRONE_ERROR;
			}
		}

		const dir: DIRECTION = move.coord.getDirectionToward(move.end);
		if (dir == null) {
			return TablutRules.IMMOBILE_MOVE_ERROR;
		}

		if (!DIRECTION.isOrthogonal(dir)) {
			return TablutRules.NOT_ORTHOGONAL_ERROR;
		}
		const dist: number = move.coord.getOrthogonalDistance(move.end);
		let c: Coord; // the inspected coord
		for (let i = 1; i < dist; i++) {
			c = move.coord.getNext(dir);
			if (board[c.y][c.x] !== TablutPartSlice.UNOCCUPIED) {
				return TablutRules.SOMETHING_IN_THE_WAY_ERROR;
			}
		}
	}

	private static captureOld(turn: number, c: Coord, d: ORTHOGONALE, board: number[][]): Coord {
		/* 1: the threatened case dont exist         -> no capture
         * 2: the threatened case is not an ennemy   -> no capture
         * 3: if the opposing case dont exist        -> no capture
         * x: if the opposing case is another ennemy -> no capture
         * x: if the opposing case is an empty throne :
         *     x: if the threatened case is a king
         *         x: is the king capturable by sandwich
         *             x: is the king capturable by an empty throne -> captured king
         *         x: else the king capturable by 4
         *             x: is the king capturable by
         *     x: the threatened case is a pawn
         *         x:
         * x: the opposing case is an ally
         *     x: if the threatened case is a king
         *         x: is the king capturable by a sandwich -> captured king
         *         x: else is the king capturable by 4
         *             x:
         */
		const threatened: Coord = c.getNext(d);
		if (!threatened.isInRange(TablutRules.WIDTH, TablutRules.WIDTH)) {
			return null; // 1
		}
		const player: 0|1 = (turn % 2 === 0) ? 0 : 1;
		const threatenedPawnOwner: number = TablutRules.getOwner(player, threatened, board);
		if (threatenedPawnOwner !== TablutRules.ENNEMY) {
			return null; // 2
		}
		const opposing: Coord = threatened.getNext(d);
		if (!opposing.isInRange(TablutRules.WIDTH, TablutRules.WIDTH)) {
			return null;
		}
		const isAllie: boolean = TablutRules.getOwner(player, opposing, board) === TablutRules.PLAYER;
		if (isAllie) {
			board[opposing.y][opposing.x] = TablutPartSlice.UNOCCUPIED;
			return opposing;
		}
		const isOpposingUnocuppiedThrone: boolean = TablutRules.isEmptyThrone(opposing, board);
		if (isOpposingUnocuppiedThrone && TablutRules.CAPTURE_PAWN_AGAINST_THRONE_RULES) {

		}
		return null;
	}

	private static capture(turn: number, landingPawn: Coord, d: ORTHOGONALE, board: number[][]): Coord {
		/* c is the piece that just moved, d the direction in witch we look for capture
		 * return the captured coord, or null if no capture possible
		 * 1. the threatened case dont exist         -> no capture
         * 2: the threatened case is not an ennemy   -> no capture
		 * 3: the threatened case is a king -> delegate calculation
		 * 4: the threatened case is a pawn -> delegate calculation
		 */
		const threatened: Coord = landingPawn.getNext(d);
		if (!threatened.isInRange(TablutRules.WIDTH, TablutRules.WIDTH)) {
			return null; // 1: the threatened case dont exist, no capture
		}
		const player: 0|1 = (turn % 2 === 0) ? 0 : 1;
		const threatenedPawnOwner: number = TablutRules.getOwner(player, threatened, board);
		if (threatenedPawnOwner !== TablutRules.ENNEMY) {
			return null; // 2: the threatened case is not an ennemy
		}
		if (TablutRules.isKing(board[threatened.y][threatened.x])) {
			return TablutRules.captureKing(turn, landingPawn, d, board);
		}
		return TablutRules.capturePawn(turn, landingPawn, d, board);
	}

	private static isKing(piece: number): boolean {
		return (piece === TablutPartSlice.PLAYER_ZERO_KING) || (piece === TablutPartSlice.PLAYER_ONE_KING);
	}

	private static captureKing(turn: number, landingPiece: Coord, d: ORTHOGONALE, board: number[][]): Coord {
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
		const kingCoord: Coord = landingPiece.getNext(d);

		const player: 0|1 = (turn % 2 === 0) ? 0 : 1;
		const backCoord: Coord = kingCoord.getNext(d); // the piece that just move is always considered in front
		const back: number = TablutRules.getOwner(player, backCoord, board);

		const leftCoord: Coord = kingCoord.getLeft(d);
		const left: number = TablutRules.getOwner(player, leftCoord, board);

		const rightCoord: Coord = kingCoord.getRight(d);
		const right: number = TablutRules.getOwner(player, rightCoord, board);

		if (!backCoord.isInRange(TablutRules.WIDTH, TablutRules.WIDTH)) { /////////////////////// 1
			let nbInvaders: number = (left === TablutRules.PLAYER ? 1 : 0);
			nbInvaders += (right === TablutRules.PLAYER ? 1 : 0);
			if (nbInvaders === 2 && TablutRules.THREE_INVADER_AND_A_BORDER_CAN_CAPTURE_KING) { // 2
				// king captured by 3 invaders against 1 border
				return kingCoord;
			} else if (nbInvaders === 1) {
				if (TablutRules.isEmptyThrone(leftCoord, board) ||
					TablutRules.isEmptyThrone(rightCoord, board)) {
					if (TablutRules.CAPTURE_KING_AGAINST_THRONE_RULES) { //////////////////////// 3
						// king captured by 1 border, 1 throne, 2 invaders
						return kingCoord;
					}
				}
			}
			// those were the only two way to capture against the borde
			return null;
		}
		if (back === TablutRules.NONE) { //////////////////////////////////////////////////////// 4
			if (!TablutRules.isThrone(backCoord)) { ///////////////////////////////////////////// 5
				return null;
			} // here, back is an empty throne
			if (!TablutRules.CAPTURE_KING_AGAINST_THRONE_RULES) { /////////////////////////////// 6
				return null;
			} // here king is capturable by this empty throne
			if (TablutRules.NORMAL_CAPTURE_WORK_ON_THE_KING) { ////////////////////////////////// 7
				return kingCoord; // king captured by 1 invader and 1 throne
			}
			if (left === TablutRules.PLAYER && right === TablutRules.PLAYER) {
				return kingCoord; // king captured by 3 invaders + 1 throne
			}
		}
		if (back === TablutRules.PLAYER) {
			if (TablutRules.NORMAL_CAPTURE_WORK_ON_THE_KING) {
				return kingCoord; // king captured by two invaders
			}
			if (left === TablutRules.PLAYER && right === TablutRules.PLAYER) {
				return kingCoord; // king captured by 4 invaders
			}
		}
		return null;
	}

	private static capturePawn(turn: number, c: Coord, d: ORTHOGONALE, board: number[][]): Coord {
		/* the pawn is the next coord after c (in direction d)
		 * c partipate in the capture
		 *
		 * So these are the different capture ways :
		 * - 2 ennemies
		 * - 1 ennemies 1 empty-throne
		 */
		const threatenedPieceCoord: Coord = c.getNext(d);

		const backCoord: Coord = threatenedPieceCoord.getNext(d); // the piece that just move is always considered in front
		const player = (turn % 2 === 0) ? 0 : 1;
		const back: number = TablutRules.getOwner(player, backCoord, board);

		if (back === TablutRules.NONE) {
			if (!TablutRules.isThrone(backCoord)) {
				return null;
			} // here, back is an empty throne
			if (TablutRules.CAPTURE_PAWN_AGAINST_THRONE_RULES) {
				return threatenedPieceCoord; // pawn captured by 1 ennemy and 1 throne
			}
		}
		if (back === TablutRules.PLAYER) {
			return threatenedPieceCoord; // pawn captured by two ennemies
		}
		return null;
	}

	private static isEmptyThrone(c: Coord, board: number[][]): boolean {
		if (TablutRules.isThrone(c)) {
			return board[c.y][c.x] === TablutPartSlice.UNOCCUPIED;
		}
		return false;
	}

	private static isThrone(c: Coord): boolean {
		const fin = TablutRules.WIDTH - 1;
		if (c.x === 0) {
			return (c.y === 0) || (c.y === fin);
		} else if (c.x === fin) { // TODO: c'est à TablutPartSlice d'avoir largeur ! pas aux règles
			return (c.y === 0) || (c.y === fin);
		} else {
			return TablutRules.isCentralThrone(c);
		}
	}

	private static isCentralThrone(c: Coord): boolean {
		let center = TablutRules.WIDTH / 2;
		center -= center % 2;
		return (c.x === center && c.y === center);
	}

	private static getOwner(player: 0|1, c: Coord, board: number[][]): number {
		const case_c: number = board[c.y][c.x];
		let owner: number;
		switch (case_c) {
			case TablutPartSlice.PLAYER_ZERO_KING:
			case TablutPartSlice.PLAYER_ZERO_PAWN:
				owner = 0;
				break;
			case TablutPartSlice.PLAYER_ONE_KING:
			case TablutPartSlice.PLAYER_ONE_PAWN:
				owner = 1;
				break;
			default :
				owner = -1;
		}
		if (owner === -1) {
			return TablutRules.NONE;
		}
		if (player !== owner) {
			return TablutRules.ENNEMY;
		}
		return TablutRules.PLAYER;
	}

	static getPossibleDestinations(turn: number, depart: Coord, board: number[][]): Coord[] {
		// search the possible destinations
		const destinations: Coord[] = [];
		let endFound: boolean;
		let foundDestination: Coord;
		for (const dir of ORTHOGONALES) {
			// on regarde dans chaque direction
			foundDestination = depart.getNext(dir);
			endFound =
				foundDestination.isInRange(TablutRules.WIDTH, TablutRules.WIDTH) &&
				TablutRules.getOwner(0, foundDestination, board) === TablutRules.NONE; // TODO: clean : 0 ici est un peu un sparadra
			while (!endFound) {
				destinations.push(foundDestination);
				endFound =
					foundDestination.isInRange(TablutRules.WIDTH, TablutRules.WIDTH) &&
					TablutRules.getOwner(0, foundDestination, board) === TablutRules.NONE; // TODO: clean : 0 ici est un peu un sparadra
			}
		}
		return destinations;
	}

	static getKingCoord(board: number[][]): Coord {
		for (let y = 0; y < TablutRules.WIDTH; y++) {
			for (let x = 0; x < TablutRules.WIDTH; x++) {
				if (TablutRules.isKing(board[y][x])) {
					return new Coord(x, y);
				}
			}
		}
		return null;
	}

	static getInvaderVictoryValue(n: MNode<TablutRules>): number {
		const tablutPartSlice: TablutPartSlice = n.gamePartSlice as TablutPartSlice;
		if (tablutPartSlice.invaderStart) {
			return Number.MIN_SAFE_INTEGER;
		}
		return Number.MAX_SAFE_INTEGER;
	}

	static getDefenderVictoryValue(n: MNode<TablutRules>): number {
		const tablutPartSlice: TablutPartSlice = n.gamePartSlice as TablutPartSlice;
		if (tablutPartSlice.invaderStart) {
			return Number.MAX_SAFE_INTEGER;
		}
		return Number.MIN_SAFE_INTEGER;
	}

	static isPlayerImmobilised(player: number, board: number[][]) {
		return TablutRules.getPlayerListMoves(
			(player % 2 === 1) ? 1 : 0,
			player,
			board).length === 0;
	}

	static getPlayerListPawns(player: 0|1, board: number[][]): Coord[] {
		const listPawn: Coord[] = [];
		let pawn: Coord;
		let owner: number;
		for (let y = 0; y < TablutRules.WIDTH; y++) {
			for (let x = 0; x < TablutRules.WIDTH; x++) {
				// pour chaque case
				pawn = new Coord(x, y);
				owner = TablutRules.getOwner(player, pawn, board);
				if ((player === 0 && owner === TablutRules.PLAYER) ||
					(player === 1 && owner === TablutRules.ENNEMY)) {
					listPawn.push(pawn);
				}
			}
		}
		return listPawn;
	}

	static getPlayerListMoves(player: 0|1, turn: number, board: number[][]): MoveCoordToCoordAndCapture[] {
		// player : 0 for the current player
		//          1 for his ennemy
		const listMoves: MoveCoordToCoordAndCapture[] = [];
		const listPawns: Coord[] = TablutRules.getPlayerListPawns(player, board);
		let pawnDestinations: Coord[];
		let newMove: MoveCoordToCoordAndCapture;
		for (const pawn of listPawns) {
			pawnDestinations = TablutRules.getPossibleDestinations(turn, pawn, board);
			for (const destination of pawnDestinations) {
				newMove = new MoveCoordToCoordAndCapture(pawn, destination);
				listMoves.push(newMove);
			}
		}
		return listMoves;
	}

	// instance methods :

	getListMoves(n: MNode<TablutRules>): { key: MoveCoordToCoordAndCapture, value: TablutPartSlice }[] {
		const listCombinaison: {key: MoveCoordToCoordAndCapture, value: TablutPartSlice}[] = [];

		const currentPartSlice: TablutPartSlice = n.gamePartSlice as TablutPartSlice;

		const currentTurn: number = currentPartSlice.turn;
		let currentBoard: number[][] = currentPartSlice.getCopiedBoard();

		const listMoves: MoveCoordToCoordAndCapture[] = TablutRules.getPlayerListMoves(
			(currentTurn % 2 === 0) ? 0 : 1,
			currentTurn, currentBoard);

		const nextTurn: number = currentTurn + 1;

		let newPartSlice: TablutPartSlice;
		let moveResult: number;
		for (const newMove of listMoves)	{
			currentBoard = currentPartSlice.getCopiedBoard();
			moveResult = TablutRules.tryMove(currentTurn, newMove, currentBoard);
			if (moveResult === TablutRules.SUCCESS) {
				newPartSlice = new TablutPartSlice(currentBoard, nextTurn, currentPartSlice.invaderStart);
				listCombinaison.push({key: newMove, value: newPartSlice});
			}
		}
		return listCombinaison;
	}

	getListMovesPeared(n: MNode<TablutRules>): { key: MoveCoordToCoordAndCapture, value: TablutPartSlice }[] {
		// TODO: pear this method, make it smarter
		const currentPartSlice: TablutPartSlice = n.gamePartSlice as TablutPartSlice;
		const currentBoard: number[][] = currentPartSlice.getCopiedBoard();
		const currentTurn: number = currentPartSlice.turn;
		let coord: Coord;
		let owner: number;
		const currentPlayer: 0|1 = (currentTurn % 2 === 0) ? 0 : 1;
		for (let y = 0; y < TablutRules.WIDTH; y++) {
			for (let x = 0; x < TablutRules.WIDTH; x++) {
				// pour chaque case
				coord = new Coord(x, y);
				owner = TablutRules.getOwner(currentPlayer, coord, currentBoard);
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
		const kingCoord: Coord = TablutRules.getKingCoord(board);
		if (kingCoord == null) { // the king is dead, long live the king
			return TablutRules.getInvaderVictoryValue(n);
		}
		if (TablutRules.isThrone(kingCoord) && ((kingCoord.x === TablutRules.WIDTH) || (kingCoord.x !== 0))) {
			// king reached one corner !
			return TablutRules.getDefenderVictoryValue(n);
		}
		if (TablutRules.isPlayerImmobilised(0, board)) {
			return Number.MIN_SAFE_INTEGER;
		}
		if (TablutRules.isPlayerImmobilised(1, board)) {
			return Number.MAX_SAFE_INTEGER;
		}
		const nbPlayerZeroPawns = TablutRules.getPlayerListPawns(0, board).length;
		const nbPlayerOnePawns = TablutRules.getPlayerListPawns(1, board).length;
		const invaderStart = tablutPartSlice.invaderStart;
		const zeroMult = invaderStart ? 1 : 2; // invaders pawn are twice as numerous
		const oneMult = invaderStart ? 2 : 1; // so they're twice less valuable
		const scoreZero = nbPlayerZeroPawns * zeroMult;
		const scoreOne = nbPlayerOnePawns * oneMult;
		return scoreZero - scoreOne;
	}

	choose(move: MoveCoordToCoordAndCapture): boolean {
		// recherche
		let choice: MNode<TablutRules>;
		if (this.node.hasMoves()) { // if calculation has already been done by the AI
			choice = this.node.getSonByMove(move); // let's not doing if twice
			if (choice !== null) {
				console.log('recalculation spared!');
				this.node.keepOnlyChoosenChild(choice);
				this.node = choice; // qui devient le plateau actuel
				return true;
			}
		}

		// copies
		let partSlice: TablutPartSlice = this.node.gamePartSlice as TablutPartSlice;
		const board: number[][] = partSlice.getCopiedBoard();
		const turn: number = partSlice.turn;
		const invaderStart: boolean = partSlice.invaderStart;

		// test
		if (TablutRules.tryMove(turn, move, board) === TablutRules.SUCCESS) {
			partSlice = new TablutPartSlice(board, turn, invaderStart);
			choice = new MNode<TablutRules>(this.node, move, partSlice);
			this.node.keepOnlyChoosenChild(choice);
			this.node = choice;
			return true;
		}
		return false;
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
