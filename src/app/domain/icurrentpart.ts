export interface ICurrentPart {
	typeGame: string;
	playerZero: string; // id
	turn: number; // -1 before it begin, 0 initial floor
	playerOne?: string; // id
	beginning?: number; // should be date; is a timestamp

	typePart?: number|string; // amicale, comptabilisée, pédagogique
	result?: number;
	/* draw = 0,
	 * resign = 1,
	 * escape = 2,
	 * victory = 3,
	 * timeout = 4,
	 * unachieved = 5 // todo : voir à mettre unachieved par défaut
	 */
	winner?: string; // joueur 1, joueur 2, null
	scorePlayerZero?: number|string; // TODO : implémenter ça
	scorePlayerOne?: number|string; // TODO : implémenter ça aussi en même temps

	historic?: string; // id (null si non sauvegardée, id d’une Historique sinon) // l'historique est l'arbre en cas de take et retakes
	listMoves: number[]; // ONLY VALABLE FOR Game able to encode and decode their move to numbers
}

export interface ICurrentPartId {
	id: string;
	part: ICurrentPart;
}
