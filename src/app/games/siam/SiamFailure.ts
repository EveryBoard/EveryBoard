export abstract class SiamFailure {
    public static ILLEGAL_PUSH: string = $localize`Illegal push because not straight or not pushing anything or leaving the board.`;

    public static ALL_PIECES_ARE_ON_BOARD: string = $localize`Vous ne pouvez plus insérer, toutes vos pièces sont déjà sur le plateau.`;

    public static WRONG_ROTATION: string = $localize`wrong rotation direction`;

    private constructor() {}
}
