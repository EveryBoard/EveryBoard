export interface ICurrentPart {
  typeGame: string;
  playerZero: string; // id
  playerOne?: string; // id
  turn?: number;
  beginning?: string; // should be date

  typePart?: number; // amicale, comptabilisée, pédagogique
  result?: number; // match nul, abandon, abandon par quittage, victoire classique, victoire par temps, inachevée
  winner?: string; // joueur 1, joueur 2, null
  scorePlayerZero?: number;
  scorePlayerOne?: number;

  historic?: string; // id (null si non sauvegardée, id d’une Historique sinon)
  lastMove?: number; // ONLY VALABLE FOR P4
}
export interface ICurrentPartId {
  id: string;
  partie: ICurrentPart;
}
