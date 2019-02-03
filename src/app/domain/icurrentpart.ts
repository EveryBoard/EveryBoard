import {MGPRequest} from './request';

export interface ICurrentPart {
	typeGame: string;
	playerZero: string; // id
	turn: number; // -1 before it begin, 0 initial floor
	playerOne?: string; // id

	beginning?: number; // should be date; is a timestamp
	lastMove?: number; // should/could? be a date; is a timestamp

	typePart?: number|string; // amicale, comptabilisée, pédagogique
	result?: number;
	/* draw = 0,
	 * resign = 1,
	 * escape = 2,
	 * victory = 3,
	 * timeout = 4,
	 * unachieved = 5 // todo : voir à mettre unachieved par défaut
	 * agreed-draw = 6
	 */
	winner?: string; // joueur 1, joueur 2, null
	scorePlayerZero?: number|string; // TODO : implémenter ça
	scorePlayerOne?: number|string; // TODO : implémenter ça aussi en même temps

	historic?: string; // id (null si non sauvegardée, id d’une Historique sinon) // l'historique est l'arbre en cas de take et retakes
	listMoves: number[]; // ONLY VALABLE FOR Game able to encode and decode their move to numbers
	request?: MGPRequest;
	/* null : rien de tout ce qui suit
	 * request.code: significations
	 * 0: 0 propose match nul
	 * 1: 1 propose match nul
	 * Note:  match nul accepté se traduit par un result égal à 6
	 * 2: 0 ajoute du temps
	 * 3: 1 ajoute du temps
	 * 4: 0 demande à reprendre d'un tour
	 * 5: 1 demande à reprendre d'un tour
	 * 6: 0 propose un rematch
	 * 7: 1 propose un rematch
	 * 8: rematch accepté
	 */
}

export interface ICurrentPartId {
	id: string;
	part: ICurrentPart;
}

export interface PICurrentPart {
	typeGame?: string;
	playerZero?: string;
	turn?: number; // -1 before it begin, 0 initial floor
	playerOne?: string; // id

	beginning?: number; // should be date; is a timestamp
	lastMove?: number; // should/could? be a date; is a timestamp

	typePart?: number|string; // amicale, comptabilisée, pédagogique
	result?: number;
	winner?: string; // joueur 1, joueur 2, null
	scorePlayerZero?: number|string; // TODO : implémenter ça
	scorePlayerOne?: number|string; // TODO : implémenter ça aussi en même temps

	historic?: string; // id (null si non sauvegardée, id d’une Historique sinon) // l'historique est l'arbre en cas de take et retakes
	listMoves?: number[]; // ONLY VALABLE FOR Game able to encode and decode their move to numbers
	request?: MGPRequest;
}
