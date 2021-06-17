export class EncapsuleFailure {

    public static WRONG_COLOR: string = $localize`Veuillez utiliser une pièce à votre couleur.`;

    public static NOT_REMAINING_PIECE: string = $localize`Veuillez utiliser une des pièces restantes.`;

    public static INVALID_PLACEMENT: string = $localize`Vous devez placer votre pièce sur une case vide ou sur une pièce plus petite.`;

    public static NOT_DROPPABLE: string = $localize`Veuillez choisir une de vos pièces parmi les pièces restantes.`;

    public static INVALID_PIECE_SELECTED: string = $localize`Veuillez sélectionner une de vos pièces ou une case où vous avez la pièce la plus grande.`;

    public static SAME_DEST_AS_ORIGIN: string = $localize`Veuillez sélectionner une case différente de la case d'origine du mouvement.`;

    public static END_YOUR_MOVE: string = $localize`Vous effectuez un déplacement, choisissez votre case de destination.`;

    private constructor() {}
}
