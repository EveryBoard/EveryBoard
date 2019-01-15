import {Rules} from '../../jscaip/Rules';
import {MoveCoord} from '../../jscaip/MoveCoord';
import {MNode} from '../../jscaip/MNode';
import {OthelloPartSlice} from './OthelloPartSlice';
import {Coord} from '../../jscaip/Coord';
import {DIRECTION, DIRECTIONS} from '../../jscaip/DIRECTION';

export class OthelloRules extends Rules {

	static getAllSwitcheds(move: MoveCoord, turn: number, board: number[][]): Coord[] {
		// try the move, do it if legal, and return the switched pieces
		const switcheds: Coord[] = [];
		for (const direction of DIRECTIONS) {
			const switchedInDir: Coord[] = OthelloRules.getDirSwitcheds(direction, move.coord, board);
			for (const switched of switchedInDir) {
				switcheds.push(switched);
			}
		}
		return switcheds;
	}

	static getDirSwitcheds(direction: DIRECTION, coord: Coord, board: number[][]): Coord[] {
		const player = board[coord.y][coord.x];
		const sandwicher: Coord = OthelloRules.foundNextPawnLike(player, direction, coord, board);
		if (sandwicher == null) {
			return []; // nothing to switch
		} // else
		// there is a switching !
		return OthelloRules.getCoordsBetween(direction, coord, sandwicher);
	}

	static foundNextPawnLike(searchedPawn: number, direction: DIRECTION, start: Coord, board: number[][]): Coord {
		// search the first pawn like 'searchedPawn' and return his coord
		// unless we meet an empty case OR reach the end of the board before it

		let testedCoord: Coord = start.getNext(direction);
		while (testedCoord.isInRange(OthelloPartSlice.BOARD_WIDTH, OthelloPartSlice.BOARD_HEIGHT)) {
			const testedCoordContent: number = board[testedCoord.y][testedCoord.x];
			if (testedCoordContent === searchedPawn) {
				// we found a 'searchedPawn', in range, in this direction
				return testedCoord;
			}
			if (testedCoordContent === OthelloPartSlice.UNOCCUPIED) {
				// we found the emptyness, so there won't be a next case
				return null;
			}
			testedCoord = testedCoord.getNext(direction);
		}
		return null; // we found the end of the board before we found 	the newt pawn like 'searchedPawn'
	}

	static getCoordsBetween(direction: DIRECTION, start: Coord, end: Coord): Coord[] {
		/* expected that both 'coord' and 'sandwicher' are in range
		 * expected that 'sandwicher' is after 'coord' in 'direction' 's direction
		 * return all the direction between 'coord' and 'sandwicher', them excluded
		 * return an empty list if both coords are neighboors
		 */
		const coords: Coord[] = [];
		let testedCoord: Coord = start.getNext(direction);
		while (!testedCoord.equals(end)) {
			coords.push(testedCoord);
			testedCoord = testedCoord.getNext(direction);
		}
		return coords;
	}

	choose(move: MoveCoord): boolean {
		if (this.node.hasMoves()) { // if calculation has already been done by the AI
			const choix: MNode<OthelloRules> = this.node.getSonByMove(move); // let's not doing if twice
			if (choix != null) {
				this.node = choix; // qui devient le plateau actuel
				return true;
			}
		}
		console.log('erh on a pas calculé flemme lol');
		return false;
	}

	getBoardValue(n: MNode<OthelloRules>): number {
		const board: number[][] = n.gamePartSlice.getCopiedBoard();
		let player0Count = 0;
		let player1Count = 0;
		for (let y = 0; y < OthelloPartSlice.BOARD_HEIGHT; y++) {
			for (let x = 0; x < OthelloPartSlice.BOARD_WIDTH; x++) {
				if (board[y][x] === OthelloPartSlice.PLAYER_ZERO) {
					player0Count++;
				}
				if (board[y][x] === OthelloPartSlice.PLAYER_ONE) {
					player1Count++;
				}
			}
		}
		return player1Count - player0Count;
	}

	getListMoves(n: MNode<OthelloRules>): { key: MoveCoord; value: OthelloPartSlice }[] {
		const listMoves: { 'key': MoveCoord, 'value': OthelloPartSlice }[] = [];

		const partSlice: OthelloPartSlice = n.gamePartSlice as OthelloPartSlice;
		let moveAppliedPartSlice: OthelloPartSlice;

		const board: number[][] = partSlice.getCopiedBoard();
		let nextBoard: number[][];
		const nextTurn: number = partSlice.turn + 1;

		const player = nextTurn === 0 ? OthelloPartSlice.PLAYER_ONE : OthelloPartSlice.PLAYER_ZERO;
		const ennemy = nextTurn === 0 ? OthelloPartSlice.PLAYER_ZERO : OthelloPartSlice.PLAYER_ONE;

		for (let y = 0; y < 8; y++) {
			for (let x = 0; x < 8; x++) {
				if (board[y][x] === OthelloPartSlice.UNOCCUPIED) {
					// For each empty cases
					nextBoard = partSlice.getCopiedBoard();
					const ennemyNeighboors = OthelloPartSlice.getNeighbooringPawnLike(nextBoard, ennemy, x, y);
					if (ennemyNeighboors.length > 0) {
						// if one of the 8 neighbooring case is an ennemy then, there could be a switch, and hence a legal move
						const move: MoveCoord = new MoveCoord(x, y);
						const result: Coord[] = OthelloRules.getAllSwitcheds(move, player, nextBoard);
						if (result.length > 0) {
							// there was switched piece and hence, a legal move
							moveAppliedPartSlice = new OthelloPartSlice(nextBoard, nextTurn);
							listMoves.push({'key': move, 'value': moveAppliedPartSlice});
						}
					}
				}
			}
		}
		return listMoves;
	}

	setInitialBoard(): void {
		if (this.node == null) {
			this.node = MNode.getFirstNode(
				new OthelloPartSlice(OthelloPartSlice.getStartingBoard(), 0),
				this
			);
		} else {
			this.node = this.node.getInitialNode();
		}
	}

}
