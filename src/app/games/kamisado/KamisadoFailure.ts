/* eslint-disable max-len */
export class KamisadoFailure {

    public static readonly CANT_PASS: string = `Vous n'êtes pas autorisé à passer, vous pouvez toujours vous déplacer.`;

    public static readonly NOT_PIECE_OF_PLAYER: string = `Choisissez une de vos pièces.`;

    public static readonly NOT_RIGHT_COLOR: string = `La pièce n'est pas de la couleur à jouer.`;

    public static readonly END_CASE_NOT_EMPTY: string = `Vous devez vous déplacer vers une case vide.`;

    public static readonly DIRECTION_NOT_ALLOWED: string = `Vous ne pouvez pas vous déplacer que vers l'avant orthogonalement ou diagonalement.`;

    public static readonly MOVE_BLOCKED: string = `Ce mouvement est obstrué.`;

    public static readonly GAME_ENDED: string = `La partie est finie.`;
}
