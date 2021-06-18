export class RulesFailure {

    public static readonly CANNOT_CHOOSE_ENEMY_PIECE: string = $localize`Vous ne pouvez pas choisir une pièce de l'ennemi.`;

    public static readonly MUST_CLICK_ON_EMPTY_CASE: string= $localize`Vous devez cliquer sur une case vide.`;

    public static readonly CANNOT_SELF_CAPTURE: string = $localize`Votre case d'arrivée doit être vide ou contenir une pièce ennemie.`;

    public static readonly MUST_LAND_ON_EMPTY_CASE: string = $localize`Vous devez déposer votre pièce sur une case vide.`;

    public static readonly CANNOT_PASS: string = $localize`Vous ne pouvez pas passer votre tour.`

    public static readonly CAN_ONLY_PASS: string = $localize`Vous êtes obligés de passer votre tour.`

    public static readonly MUST_CHOOSE_OWN_PIECE_NOT_EMPTY: string = 'vous avez sélectionné une case vide, vous devez sélectionner l\'une de vos pièces.'

    private constructor() {}
}
