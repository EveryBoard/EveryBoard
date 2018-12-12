import {MoveCoord} from '../../jscaip/MoveCoord';

export class QuartoMove extends MoveCoord {

	readonly piece: number;

	constructor(x: number, y: number, piece: number) {
		/* (x, y) is the coord where you put the 'inHand' quarto piece
    	 * piece is the quarto piece you give
    	 */
		super(x, y);
		this.piece = piece;

	}

	static encode(qm: QuartoMove): number {
		const x: number = qm.coord.x;
		const y: number = qm.coord.y;
		const p: number = qm.piece;
		return (x * 64) + (y * 16) + p;
	}

	static decode(xyp: number): QuartoMove {
		// traduit en UN entier le pion choisis, encodé sous la forme binaire
		// xx yy pppp
		const piece: number = xyp % 16; // résultat de 0 à 15
		xyp -= piece;
		xyp /= 16;
		const y: number = xyp % 4;
		xyp -= y;
		xyp /= 4;
		const x: number = xyp;
		return new QuartoMove(x, y, piece);
	}

	toString(): string {
		return 'QuartoMove{' +
			'piece=' + this.piece +
			' at (' + this.coord.x +
			', ' + this.coord.y +
			')}';
	}

	equals(o: any): boolean {
		if (!(o instanceof QuartoMove)) {
			return false;
		}
		if (!super.equals(o)) {
			return false;
		}
		const other: QuartoMove = o as QuartoMove;
		return this.piece === other.piece;
	}

}
