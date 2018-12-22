import {Rules} from '../../jscaip/Rules';
import {MNode} from '../../jscaip/MNode';
import {GamePartSlice} from '../../jscaip/GamePartSlice';
import {Move} from '../../jscaip/Move';

export class TablutRules extends Rules {

	getListMoves(n: MNode<TablutRules>): { key: Move; value: GamePartSlice }[] {
		return [];
	}

	getBoardValue(n: MNode<TablutRules>): number {
		/* const tablutPartSlice: TablutPartSlice = n.gamePartSlice as TablutPartSlice;
		const board: number[][] = tablutPartSlice.getCopiedBoard();
		const zerosPawn = TablutRules.countZerosPawn(board);
		const onesPawn = TablutRules.countOnesPawn(board);
		*/
		return 0;
	}

	choose(move: Move): boolean {
		return false;
	}

	setInitialBoard(): void {
	}

	toString(): string {
		return super.toString();
	}

}
