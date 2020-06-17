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
export class Part {

    public constructor(
        private readonly typeGame: string,
        private readonly playerZero: string,
        private readonly turn: number,
        private readonly listMoves: number[],
        private readonly result: number,
        private readonly playerOne?: string,

        private readonly beginning?: number,
        private readonly lastMove?: number,
        private readonly typePart?: number|string,
        private readonly winner?: string,
        private readonly scorePlayerZero?: number|string, // TODO : implémenter ça
        private readonly scorePlayerOne?: number|string, // TODO : implémenter ça aussi en même temps

        private readonly historic?: string,
        private readonly request?: MGPRequest
    ) {
        if (typeGame == null) throw new Error("typeGame can't be null");
        if (playerZero == null) throw new Error("playerZero can't be null");
        if (turn == null) throw new Error("turn can't be null");
        if (listMoves == null) throw new Error("listMoves can't be null");
        for (let move of listMoves)
            if (move == null)
                throw new Error("No element in listMoves can be null");
        if (result == null) throw new Error("result can't be null");
    }
    public copy(): ICurrentPart {
        const copied: ICurrentPart = {
            typeGame: this.typeGame,
            playerZero: this.playerZero,
            turn: this.turn,
            listMoves: this.listMoves.map((move: number) => move),
            result: this.result
        }
        if (this.playerOne != null) copied.playerOne = this.playerOne;
        if (this.beginning != null) copied.beginning = this.beginning;
        if (this.lastMove != null) copied.lastMove = this.lastMove;
        if (this.typePart != null) copied.typePart = this.typePart;
        if (this.winner != null) copied.winner = this.winner;
        if (this.scorePlayerZero != null) copied.scorePlayerZero = this.scorePlayerZero;
        if (this.scorePlayerOne != null) copied.scorePlayerOne = this.scorePlayerOne;
        if (this.historic != null) copied.historic = this.historic;
        if (this.request != null) copied.request = this.request; // TODO deepcopy
        return copied;
    }
}
export interface ICurrentPartId {

    id: string;

    doc: ICurrentPart;
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