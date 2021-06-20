export class KamisadoFailure {

    public static readonly CANT_PASS: string = $localize`Vous n'êtes pas autorisé à passer, vous pouvez toujours vous déplacer.`;

    public static readonly NOT_PIECE_OF_PLAYER: string = $localize`Choisissez une de vos pièces.`;

    public static readonly NOT_RIGHT_COLOR: string = $localize`La pièce n'est pas de la couleur à jouer.`;

    public static readonly END_CASE_NOT_EMPTY: string = $localize`Vous devez vous déplacer vers une case vide.`;

    public static readonly DIRECTION_NOT_ALLOWED: string = $localize`Vous ne pouvez pas vous déplacer que vers l'avant orthogonalement ou diagonalement.`;

    public static readonly MOVE_BLOCKED: string = $localize`Ce mouvement est obstrué.`;

    public static readonly GAME_ENDED: string = $localize`La partie est finie.`

    public static readonly PLAY_WITH_SELECTED_PIECE: string = $localize`Vous devez jouer avec la pièce déjà séléctionnée.`;

    private constructor() {}
}
