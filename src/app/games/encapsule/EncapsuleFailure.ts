export class EncapsuleFailure {

    public static readonly WRONG_COLOR: string = $localize`Veuillez utiliser une de vos pièces.`;

    public static readonly PIECE_OUT_OF_STOCK: string = $localize`Vous n'avez plus de pièces de ce type.`;

    public static readonly INVALID_PLACEMENT: string = $localize`Vous devez placer votre pièce sur une case vide ou sur une pièce plus petite.`;

    public static readonly NOT_DROPPABLE: string = $localize`Veuillez choisir une de vos pièces parmi les pièces restantes.`;

    public static readonly INVALID_PIECE_SELECTED: string = $localize`Veuillez sélectionner une de vos pièces ou une case où vous avez la pièce la plus grande.`;

    public static readonly SAME_DEST_AS_ORIGIN: string = $localize`Veuillez sélectionner une case différente de la case d'origine du mouvement.`;

    public static readonly END_YOUR_MOVE: string = $localize`Vous effectuez un déplacement, choisissez votre case de destination.`;
}
