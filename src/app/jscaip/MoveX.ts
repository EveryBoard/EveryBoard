import {Move} from './Move';

export class MoveX extends Move {

	// static fields:

	private static pool: Array<MoveX> = new Array<MoveX>();

	// instance fields

	public readonly x: number;

	public static get(x: number): MoveX {
		const newMove: MoveX = new MoveX(x);
		for (const existingMove of MoveX.pool) {
			if (existingMove.equals(newMove)) {
				return existingMove;
			}
		}
		MoveX.pool.push(newMove);
		return newMove;
	}

	protected constructor(x: number) {
		super();
		this.x = x;
	}

	public hashCode(): number {
		return this.x;
	}

	public equals(o: any): boolean {
		if (this === o) {
			return true;
		}
		if (o === null) {
			return false;
		}
		const other: MoveX = <MoveX> o;
		if (this.x !== other.x) {
			return false;
		}
		return true;
	}

	public toString(): string {
		return 'MoveX(' + this.x + ')';
	}
}

