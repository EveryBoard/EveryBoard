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
		/* x va de 0 à 3
		 * y va de 0 à 3
		 * p va de 0 à 16 compris, 16 pour le dernier tour
		 */
		const x: number = qm.coord.x;
		const y: number = qm.coord.y;
		const p: number = qm.piece;
		return (x * 128) + (y * 32) + p;
	}

	static decode(xyp: number): QuartoMove {
		// traduit en UN entier le pion choisis, encodé sous la forme binaire
		// xx yy ppppp
		const piece: number = xyp % 32; // résultat de 0 à 16
		xyp -= piece;
		xyp /= 32;
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
