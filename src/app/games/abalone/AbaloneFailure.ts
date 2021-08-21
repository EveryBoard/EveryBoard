export class AbaloneFailure {

    public static readonly CANNOT_MOVE_MORE_THAN_THREE_PIECES: string = $localize`Vous ne pouvez pas déplacer plus de 3 de vos pièces !`;

    public static readonly NOT_ENOUGH_PIECE_TO_PUSH: string = $localize`Vous n'avez pas assez de pièce pour pousser ce groupe !`;

    public static readonly CANNOT_PUSH_YOUR_OWN_PIECES: string = $localize`Vous ne pouvez pas pousser cette/ces pièce(s) car elle est bloquée par l'une des vôtres !`;

    public static readonly MUST_ONLY_TRANSLATE_YOUR_PIECES: string = $localize`Cette ligne contient des pièces ennemies ou des cases vides, ceci est interdit.`;

    public static readonly TRANSLATION_IMPOSSIBLE: string = $localize`Ce mouvement est impossible, certaines case d'atterrissage sont occupées.`;

    public static readonly LINE_AND_COORD_NOT_ALIGNED: string = $localize`Cette case n'est pas alignée avec la ligne actuellement formée.`;
}
