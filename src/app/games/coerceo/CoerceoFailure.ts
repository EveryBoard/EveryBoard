export class CoerceoFailure {

    public static INVALID_DISTANCE: string = $localize`Distance de déplacement illégal, votre pion doit atterir sur l'un des six triangles de même couleur les plus proches.`;

    public static NOT_ENOUGH_TILES_TO_EXCHANGE: string = $localize`Vous n'avez pas assez de plaques à échanger pour capturer cette pièce. Choisissez une de vos pièces et déplacez-la.`

    public static FIRST_CLICK_SHOULD_NOT_BE_NULL: string = $localize`Votre premier clic doit être sur une de vos pièce pour la déplacer, ou sur une pièce ennemie pour l'échanger contre deux plaques.`;

    public static CANNOT_CAPTURE_FROM_REMOVED: string = $localize`You cannot capture on a removed tile.`

    public static CANNOT_CAPTURE_FROM_EMPTY: string = $localize`You cannot capture from an empty case.`

    public static CANNOT_CAPTURE_OWN_PIECES: string = $localize`You cannot capture your own pieces.`
}
