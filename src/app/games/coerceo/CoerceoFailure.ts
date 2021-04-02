/* eslint-disable max-len */
export class CoerceoFailure {

    public static INVALID_DISTANCE: string = 'Distance de déplacement illégal, votre pion doit atterir sur l\'un des six triangles de même couleur les plus proches';

    public static CANNOT_LAND_ON_ALLY: string = 'Vous ne pouvez pas déplacer vos pièces sur vos propres pièces.';

    public static MUST_CHOOSE_OWN_PIECE_NOT_EMPTY: string = 'vous avez sélectionné une case vide, vous devez sélectionner l\'une de vos pièces.'

    public static NOT_ENOUGH_TILES_TO_EXCHANGE: string = 'Vous n\'avez pas assez de plaques à échanger pour capturer cette pièce. Choisissez une de vos pièces et déplacez la.'

    public static FIRST_CLICK_SHOULD_NOT_BE_NULL: string = 'Votre premier clic doit être sur une de vos pièce pour la déplacer, ou sur une pièce ennemie pour l\'échanger contre deux plaques!';
}
