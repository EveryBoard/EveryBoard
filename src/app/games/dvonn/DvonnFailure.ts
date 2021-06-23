/* eslint-disable max-len */

export class DvonnFailure {

    public static readonly INVALID_COORD: string = `Coordonnée invalide, veuillez sélectionner un pièce sur le plateau.`;

    public static readonly NOT_PLAYER_PIECE: string = `Veuillez choisir une des piles vous appartenant.`;

    public static readonly EMPTY_STACK: string = `Veuillez choisir une pile qui n'est pas vide.`;

    public static readonly TOO_MANY_NEIGHBORS: string = `Cette pile ne peut pas se déplacer car les 6 cases voisines sont occupées. Veuillez choisir une pièce avec strictement moins de 6 pièces voisines.`;

    public static readonly CANT_REACH_TARGET: string = `Cette pièce ne peut pas se déplacer car il est impossible qu'elle termine son déplacement sur une autre pièce.`;

    public static readonly CAN_ONLY_PASS: string = `Vous êtes obligés de passer, il n'y a aucun déplacement possible.`;

    public static readonly INVALID_MOVE_LENGTH: string = `La distance effectuée par le mouvement doit correspondre à la taille de la pile de pièces.`;

    public static readonly EMPTY_TARGET_STACK: string = `Le déplacement doit se terminer sur une case occupée.`;
}
