export class LinesOfActionFailure {

    public static readonly INVALID_MOVE_LENGTH: string = $localize`Vous devez vous effectuer un déplacement de longueur égale au nombre de pièces présente sur la ligne de votre déplacement.`;

    public static readonly CANNOT_JUMP_OVER_ENEMY: string = $localize`Vous ne pouvez pas passer au dessus d'une pièce ennemie.`;

    public static readonly NOT_YOUR_PIECE: string = $localize`Veuillez sélectionner une de vos propres pièces.`;

    public static readonly PIECE_CANNOT_MOVE: string = $localize`Cette pièce n'a aucun mouvement possible, choisissez-en une autre.`;

    public static readonly INVALID_DIRECTION: string = $localize`Un mouvement dois se faire selon une direction orthogonale ou diagonale.`;
}
