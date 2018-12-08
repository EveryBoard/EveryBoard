import {MoveCoord} from '../../jscaip/MoveCoord';

export class QuartoMove extends MoveCoord {

	protected piece: number;

	constructor(x: number, y: number, piece: number) {
		/* (x, y) is the coord where you put the 'inHand' quarto piece
    	 * piece is the quarto piece you give
    	 */
		super(x, y);
		this.piece = piece;

	}

	toString(): string {
		return 'QuartoMove{' +
			'piece=' + this.piece +
			' at (' + this.coord.x +
			', ' + this.coord.y +
			')}';
	}

	equals(o: any): boolean {
		if (!(o instanceof  QuartoMove)) {
			return false;
		}
		if (!super.equals(o)) {
			return false;
		}
		const other: QuartoMove = o as QuartoMove;
		return this.piece === other.piece;
	}

}
