export abstract class SiamFailure {

    public static readonly ILLEGAL_PUSH: string = `Illegal push because not straight or not pushing anything or leaving the board`;

    public static readonly NO_REMAINING_PIECE_TO_INSERT: string = 'Vous ne pouvez plus insérer, toutes vos pièces sont déjà sur le plateau!';

    public static readonly NOT_ENOUGH_FORCE_TO_PUSH: string = `Vous ne pouvez pas pousser, vous n'avez pas assez de forces`;

    public static readonly ILLEGAL_ROTATION: string = `Vous ne pouvez pas tourner et avancer en même temps!`;
}
