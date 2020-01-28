import {DIRECTION, DIRECTIONS, XY} from '../../jscaip/DIRECTION';
import {Coord} from '../../jscaip/Coord';
import {Rules} from '../../jscaip/Rules';
import {MoveX} from '../../jscaip/MoveX';
import {SCORE} from '../../jscaip/SCORE';
import {MNode} from '../../jscaip/MNode';
import {P4PartSlice} from './P4PartSlice';
import { MGPMap } from 'src/app/collectionlib/MGPMap';
import { LegalityStatus } from 'src/app/jscaip/LegalityStatus';
import { Player } from 'src/app/jscaip/Player';

export class P4Rules extends Rules<MoveX, P4PartSlice, LegalityStatus> {

    public applyLegalMove(move: MoveX, slice: P4PartSlice, status: LegalityStatus): { resultingMove: MoveX; resultingSlice: P4PartSlice; } {
        const x: number = move.x;
        const board: number[][] = slice.getCopiedBoard();
        const y = P4Rules.getLowestUnoccupiedCase(board, x);

        const turn: number = slice.turn;

        board[y][x] = (turn % 2 === 0) ? Player.ZERO.value : Player.ONE.value;

        const resultingSlice: P4PartSlice = new P4PartSlice(board, turn+1);
        return {resultingMove: move, resultingSlice};
    }

	// statics fields:

	static VERBOSE = false;

	// statics methods:

	static getBoardValueShortened(n: MNode<P4Rules, MoveX, P4PartSlice, LegalityStatus>): number {
		// let mother: MNode<P4Rules, MoveX, P4PartSlice, LegalityStatus> = < MNode<P4Rules, MoveX, P4PartSlice, LegalityStatus> > n.getMother(); // is not null, otherwise this method should not have been called
		// let previousBoardValue: number = mother.getOwnValue(); // is not null either logically
		// let move: MoveCoord = < MoveCoord > n.getMove();
		// let x: number = move.coord.x;
		// let y: number = move.coord.y;
		// 1. for each direction where there is an ennemy block
		//  a. for the 1 to 3 ennemy block in a row
		if (P4Rules.VERBOSE) {
			console.log('getBoardValueShortened appell�e');
		}
		return 0; // TODO
	}

	static getBoardValueFromScratch(n: MNode<P4Rules, MoveX, P4PartSlice, LegalityStatus>): number {
		if (P4Rules.VERBOSE) {
			console.log('getBoardValueFromScratch appell�e');
			P4Rules.debugPrintBiArray(n.gamePartSlice.getCopiedBoard());
		}
		const p4Board: P4PartSlice = n.gamePartSlice;
		const currentBoard: number[][] = p4Board.getCopiedBoard();
		let score = 0;
		let tmpScore = 0;
		let y: number;
		let x = 0;

		while (x < 7) {
			// pour chaque colonne
			y = 0; // on commence en bas
			while (y !== 6 && currentBoard[y][x] !== Player.NONE.value) {
				// tant qu'on a pas atteint le haut ni une case inoccup�e

				tmpScore = P4Rules.getCaseScore(currentBoard, new Coord(x, y));
				if (MNode.getScoreStatus(tmpScore) !== SCORE.DEFAULT) {
					// si on trouve un [pr�]victoire
					// System.out.println(node + ':: victoire ou pr� - victoire(' + tmpScore + ') en (' + x + ', ' + y + ')');
					return tmpScore; // on la retourne
					// TODO v�rifier que PRE_VICTORY n'�crase pas les VICTORY dans ce cas ci
				}
				score += tmpScore;
				y++; // et on remonte
			}
			x++;
		}
		return score;
	}

	static getLowestUnoccupiedCase(board: number[][], x: number): number {
		let y = 6;
		while (y > 0 && board[y - 1][x] === Player.NONE.value) {
			y--;
		}
		return y;
	}

	static getMod(camp: number): number {
		if (camp === Player.ZERO.value) {
			return -1;
		}
		if (camp === Player.ONE.value) {
			return +1;
		}
		throw new Error('Illegal case content for P4, nor X pawn nor O pawn.'); // NEW, shouldnt append
		// OLDDLY return 0; // shouldn't append
	}

	static getHalfLineScore(board: number[][], i: Coord, dir: DIRECTION, ennemi: number, allie: number): number[] {
		/* Anciennement nomm� 'countLine'
       *
       * pour une case i(iX, iY) contenant un pion 'allie' (dont les ennemis sont naturellement 'ennemi'
       * on parcours le plateau à partir de i dans la direction d(dX, dY)
       * et ce à une distance maximum de 3 cases
       */

		let c: number; // current case
		let freeSpaces = 0; // le nombre de case libres align�es
		let allies = 0; // le nombre de case alli�es align�es
		let allAlliesAreSideBySide = true;
		let co: Coord = new Coord(i.x + dir.x, i.y + dir.y);
		while (co.isInRange(7, 6) && freeSpaces !== 3) {
			// tant qu'on ne sort pas du plateau
			c = board[co.y][co.x];
			if (c === ennemi) {
				return [freeSpaces, allies];
			}
			if (c === allie && allAlliesAreSideBySide) {
				allies++;
			} else {
				allAlliesAreSideBySide = false; // on arr�te de compter les alli�es sur cette ligne
			}
			// dès que l'un d'entre eux n'est plus coll�
			freeSpaces++;
			// co = new Coord(co.x + dir.x, co.y + dir.y);
			co = co.getNext(dir);
		}
		return [freeSpaces, allies];
	}

	static getEnnemi(board: number[][], coord: Coord): number {
		const c: number = board[coord.y][coord.x];
		return (c === Player.NONE.value) ? Player.NONE.value
			: ((c === Player.ONE.value) ? Player.ZERO.value
				: Player.ONE.value);
	}

	static getCaseScore(board: number[][], c: Coord): number {
		if (P4Rules.VERBOSE) {
			console.log('getCaseScore(board, ' + c.x + ', ' + c.y + ') appell�e');
			P4Rules.debugPrintBiArray(board);
		}
		if (board[c.y][c.x] === Player.NONE.value) {
			throw new Error('cannot call getCaseScore on empty case');
		}
		// anciennement nomm� countPossibility
		let score = 0; // final result, count the theoretical victorys possibility
		let lineDist = 0;
		let lineAllies = 0;

		const ennemi: number = P4Rules.getEnnemi(board, c);
		const allie: number = board[c.y][c.x];

		const distByDirs: number[] = [];
		const alliesByDirs: number[] = [];

		let tmpDist: number;
		let tmpAllies: number;
		let tmpData: number[];
		let i = 0;
		for (const dir of DIRECTIONS) {
			tmpData = P4Rules.getHalfLineScore(board, c, dir, ennemi, allie);
			tmpDist = tmpData[0];
			tmpAllies = tmpData[1];
			distByDirs[i] = tmpDist;
			alliesByDirs[i] = tmpAllies;
			i++;
		}
		i = 0;
		while (i < 4) {
			// pour chaque duo de direction
			// lineAllies = 1 + alliesByDirs[i] + alliesByDirs[7 - i];
			lineAllies = alliesByDirs[i] + alliesByDirs[i + 4]; // in the two opposite dirs
			// System.out.println('lineAllies = ' + lineAllies + ' in (' + x + ', ' + y + ') pour dir ' + i);
			if (lineAllies > 2) {
				if (P4Rules.VERBOSE) {
					console.log('there is some kind of victory here (' + c.x + ', ' + c.y + ')');
					console.log('line allies : ' + lineAllies);
					console.log('i : ' + i);
					P4Rules.debugPrintBiArray(board);
				}
				return allie === Player.ZERO.value
					? Number.MIN_SAFE_INTEGER
					: Number.MAX_SAFE_INTEGER;
			}

			lineDist = distByDirs[i] + distByDirs[7 - i];
			if (lineDist >= 3) {
				score += lineDist - 2;
			}
			i++;
		}
		return score * P4Rules.getMod(allie);
	}

	static countLinePossibility(board: number[][], i: XY, d: XY): number {
		// TODO countLinePossibility
		return 0;
	}

	static getLineScore(line: number[], playable: boolean[], playableVictory: number[][]): number {
		// x + 0. count Victory
		// if victory return MAX/MIN: this must be the final result
		// x + 1. count monoVictory
		// if _one_ monoVictory payable of player X and it's he's turn:
		// return (MAX - 1)/(MIN + 1)
		// if two monoVictory playable return (MAX - 1)/(MIN + 1): this must be the final result
		// x + 2. count duoVictory in the rest that don't use the monoVictory
		// x + 3. count trioVictory in the rest that don't use nor monoVictory nor full group of duoVictory

		// TODO: implement
		return 0;
	}

	static getBoardValueByLine(n: MNode<P4Rules, MoveX, P4PartSlice, LegalityStatus>): number {
		const partSlice: P4PartSlice = n.gamePartSlice;
		const board: number[][] = partSlice.getCopiedBoard();
		// calcul par ligne
		// ix, iy = i(x, y): i(init) est la coord d�but de la ligne à compter
		// dx, dy = d(x, y): d(direction) est le vecteur donnant la direction de la ligne
		let score = 0;
		let scoreStatut: SCORE;
		let tmpScore: number;
		let yMax = 0;

		const diagonalesDescendantes: boolean[] = [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
		];
		/* les diagonales descendantes ont pour indice (x + y) des cases qui passent par elles
       * x allant de 0 et 6 et y de 0 à 5: x + y va de 0 à 11
       * seules les 6 diagonales descendantes de 3 à 8 sont de longueur 4 ou plus
       * seules elles peuvent donc contenir un puissance 4
       */

		const diagonalesMontantes: boolean[] = [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
		];
		/* les diagonales descendantes ont pour indice (x - y) des cases qui passent par elles
       * x allant de 0 et 6 et y de 0 à 5: x - y va de - 5 à 6
       * nous ne pouvons accepter un indice n�gatif, nous rajoutons donc 5 à x - y
       * seules les 6 diagonales montantes de - 2( + 5 = 3) à 3( + 5 = 8) sont de longueur 4 ou plus
       * seules elles peuvent donc contenir un puissance 4
       */

		let y: number;
		let x = 0;
		while (x < 7) {
			if (board[0][x] !== Player.NONE.value) {
				y = 0;
				do {
					tmpScore = this.getScoreColonne_A_TESTER(board, x);
					scoreStatut = MNode.getScoreStatus(tmpScore);
					if (scoreStatut !== SCORE.DEFAULT) {
						return tmpScore;
					}
					score += tmpScore;

					yMax = y > yMax ? y : yMax;

					diagonalesDescendantes[x + y] = true; // voir commentaires des variables
					diagonalesMontantes[x - y + 5] = true; // voir commentaires des variables

					y++;
				} while (y < 6 && board[y][x] !== Player.NONE.value);
			}
			x++;
		}
		let d = 3;
		while (d < 9) {
			if (diagonalesDescendantes[d]) {
				tmpScore = P4Rules.getScoreDD(board, d);
				scoreStatut = MNode.getScoreStatus(tmpScore);
				if (scoreStatut !== SCORE.DEFAULT) {
					return tmpScore;
				}
				score += tmpScore;
			}
			if (diagonalesMontantes[d]) {
				tmpScore = P4Rules.getScoreDM(board, d);
				scoreStatut = MNode.getScoreStatus(tmpScore);
				if (scoreStatut !== SCORE.DEFAULT) {
					return tmpScore;
				}
				score += tmpScore;
			}
			d++;
		}
		while (yMax > 0) {
			tmpScore = P4Rules.getScoreHorizontal(board, yMax);
			scoreStatut = MNode.getScoreStatus(tmpScore);
			if (scoreStatut !== SCORE.DEFAULT) {
				return tmpScore;
			}
			score += tmpScore;
			yMax--;
		}
		if (P4Rules.VERBOSE) {
			console.log('board Value evaluated without (pre)victory to ' + score);
		}
		return score;
	}

	static getScoreColonne_A_TESTER(board: number[][], x: number): number {
		let nInALine = 1;
		const upperFound = false; // il n'y aura dans une rang�e qu'une seule case jouable
		let aligner: number = board[0][x]; // toujours occup� si on appelle cette rang�e
		const line: number[] = [
			aligner,
			Player.NONE.value,
			Player.NONE.value,
			Player.NONE.value,
			Player.NONE.value,
			Player.NONE.value
		];
		const playableVictory: number[][] = [[-1, -1], [-1, -1]]; // TODO ADAPTER ça aux autres
		const playable: boolean[] = [false, false, false, false, false, false];
		let c: number; // current case
		let y = 1;
		while (y < 6) {
			c = board[y][x];
			line[y] = c;
			if (c === aligner) {
				// si cette case est du m�me genre que la pr�c�dente
				nInALine++; // il en a donc une de plus d'align�e
			} else {
				// cette case est diff�rente de la pr�c�dente
				if (nInALine === 4) {
					if (P4Rules.VERBOSE) {
						console.log('there is some kind of victory here 2');
					}
					return aligner === Player.ZERO.value
						? Number.MIN_SAFE_INTEGER
						: Number.MAX_SAFE_INTEGER;
				}
				if (c === Player.NONE.value) {
					playable[y] = true;
					return P4Rules.getLineScore(line, playable, playableVictory);
				}
				nInALine = 1;
				aligner = c;
			}
			y++;
		}
		if (nInALine === 4) {
			if (P4Rules.VERBOSE) {
				console.log('there is some kind of victory here 3');
			}
			return aligner === Player.ZERO.value
				? Number.MIN_SAFE_INTEGER
				: Number.MAX_SAFE_INTEGER;
		}
		return P4Rules.getLineScore(line, playable, playableVictory);
	}

	static getScoreDD(board: number[][], d: number): number {
		// TODO getScoreDD
		return 0;
	}

	static getScoreDM(board: number[][], d: number): number {
		// TODO getScoreDM
		return 0;
	}

	static getScoreHorizontal(board: number[][], y: number): number {
		// TODO getScoreHorizontal
		return 0;
	}

	static debugPrintArray(array: number[]) {
		console.log('[' + array[0]);
		let i = 1;
		while (i < array.length) {
			console.log(', ' + array[i]);
			i++;
		}
		console.log(']');
	}

	static debugPrintBiArray(bo: Array<Array<number>>) {
		let retour = '';
		for (const line of bo) {
			for (const char of line) {
				retour += char;
			}
			console.log(retour);
			retour = '';
		}
	}

	// static delegates

	static getListMoves(n: MNode<P4Rules, MoveX, P4PartSlice, LegalityStatus>): MGPMap<MoveX, P4PartSlice> {
		if (P4Rules.VERBOSE) {
			console.log('P4Rules._getListMoves appell� sur ');
			P4Rules.debugPrintBiArray(n.gamePartSlice.getCopiedBoard());
		}
		// ne doit �tre appell� que si cette partie n'est pas une partie finie
		const originalPartSlice: P4PartSlice = n.gamePartSlice;
		const originalBoard: number[][] = originalPartSlice.getCopiedBoard();
		const retour: MGPMap<MoveX, P4PartSlice> = new MGPMap<MoveX, P4PartSlice>();
		const turn: number = originalPartSlice.turn;
		let y: number;
		let move: MoveX;

		let x = 0;
		while (x < 7) {
			if (originalPartSlice.getBoardByXY(x, 5) === Player.NONE.value) {
				y = P4Rules.getLowestUnoccupiedCase(originalBoard, x);

				move = MoveX.get(x);
				let newBoard: number[][] = [];

				newBoard = originalPartSlice.getCopiedBoard();

				newBoard[y][x] = (turn % 2 === 0) ? Player.ZERO.value : Player.ONE.value;

				const newPartSlice = new P4PartSlice(newBoard, turn + 1);

				retour.put(move, newPartSlice);
			}
			x++;
		}
		return retour;
	}

	static getBoardValue(n: MNode<P4Rules, MoveX, P4PartSlice, LegalityStatus>): number {
		/* if (n.getMother() == null) {
          return P4Rules.getBoardValueFromScratch(n);
        } else {
          return P4Rules.getBoardValueShortened(n);
        }
        */
		if (P4Rules.VERBOSE) {
			console.log('P4Rules._getBoardValue called');
			P4Rules.debugPrintBiArray(n.gamePartSlice.getCopiedBoard());
		}
		return P4Rules.getBoardValueFromScratch(n);
	}

	// instance methods

	constructor() {
		super();
		this.node = MNode.getFirstNode(
			new P4PartSlice(P4PartSlice.getStartingBoard(), 0),
			this
		);
	}

	// Overrides:

    public isLegal(move: MoveX): LegalityStatus {
        const ILLEGAL: LegalityStatus = {legal: false};
        if (move.x < 0 || move.x > 6) return ILLEGAL;
        if (this.node.gamePartSlice.getBoardByXY(move.x, 5) !== Player.NONE.value) return ILLEGAL;
        return {legal: true};
	}

    public setInitialBoard(): void {
		if (this.node == null) {
			this.node = MNode.getFirstNode(
				new P4PartSlice(P4PartSlice.getStartingBoard(), 0),
				this
			);
		} else {
			this.node = this.node.getInitialNode();
		}
	}

    public getListMoves(n: MNode<P4Rules, MoveX, P4PartSlice, LegalityStatus>): MGPMap<MoveX, P4PartSlice> {
        return P4Rules.getListMoves(n);
    }

    public getBoardValue(n: MNode<P4Rules, MoveX, P4PartSlice, LegalityStatus>): number {
        if (P4Rules.VERBOSE) {
            console.log('P4Rules instance methods getBoardValue called');
            P4Rules.debugPrintBiArray(n.gamePartSlice.getCopiedBoard());
        }
        return P4Rules.getBoardValue(n);
    }
}