import {Coord} from './Coord';

export abstract class GamePartSlice {

    public toString(): String {
        return "(t:"+this.turn+") = " + JSON.stringify(this.board);
    }

	protected readonly board: number[][];

	public readonly turn: number;

	// contructor ;

	constructor(b: number[][], turn: number) {
		this.board = b;
		this.turn = turn;
	}

	// Statics:

	public static setAllValueTo(board: number[][], value: number) {
		let y = board.length - 1;
		while (y >= 0) {
			let x = board[y].length - 1;
			while (x >= 0) {
				board[y][x] = value;
				x--;
			}
			y--;
		}
	}

	public static createBiArray(width: number, height: number, initValue: number): number[][] {
		const retour: Array<Array<number>> = new Array<Array<number>>();
		let y = height - 1;
		while (y >= 0) {
			retour[y] = new Array<number>();
			let x = width - 1;
			while (x >= 0) {
				retour[y][x] = initValue;
				x--;
			}
			y--;
		}
		return retour;
	}

	public static copyBiArray(biArray: number[][]): number[][] {
		const retour: Array<Array<number>> = new Array<Array<number>>();
		let y = 0;
		while (y < biArray.length) {
			retour[y] = GamePartSlice.copyArray(biArray[y]);
			y++;
		}
		return retour;
	}

	public static copyArray(array: number[]): number[] {
		const retour: Array<number> = new Array<number>();
		let x = 0;
		while (x < array.length) {
			retour[x] = array[x];
			x++;
		}
		return retour;
	}

	// Getters

	public getBoardByXY(x: number, y: number): number {
		return this.board[y][x];
	}

	public getBoardAt(c: Coord): number {
		return this.board[c.y][c.x];
	}

	// Methods:

	public getCopiedBoard(): number[][] {
		return GamePartSlice.copyBiArray(this.board);
	}
}