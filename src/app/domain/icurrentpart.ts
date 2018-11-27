export interface ICurrentPart {
  typeGame: string;
  playerZero: string; // id
  playerOne?: string; // id
  turn: number; // -1 before it begin, 0 initial floor
  beginning?: string; // should be date

  typePart?: number; // amicale, comptabilisée, pédagogique
  result?: number; // match nul, abandon, abandon par quittage, victoire classique, victoire par temps, inachevée
  winner?: string; // joueur 1, joueur 2, null
  scorePlayerZero?: number;
  scorePlayerOne?: number;

  historic?: string; // id (null si non sauvegardée, id d’une Historique sinon) // l'historique est l'arbre en cas de take et retakes
  listMoves: number[]; // ONLY VALABLE FOR Number-encoded games
}
export interface ICurrentPartId {
  id: string;
  part: ICurrentPart;
}
