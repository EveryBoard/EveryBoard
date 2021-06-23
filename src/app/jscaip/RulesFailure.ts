/* eslint-disable max-len */
// eslint-disable-next-line quotes

export class RulesFailure {

    public static readonly CANNOT_CHOOSE_ENNEMY_PIECE: string = `Vous ne pouvez pas choisir une pièce de l'ennemi.`;

    public static readonly MUST_CHOOSE_PLAYER_PIECE: string = `Vous devez choisir une de vos pièces.`;

    public static readonly MUST_CLICK_ON_EMPTY_CASE: string = 'Vous devez cliquer sur une case vide.';

    public static readonly CANNOT_SELF_CAPTURE: string = `Votre case d'arrivée doit être vide ou contenir une pièce ennemie.`;

    public static readonly MUST_LAND_ON_EMPTY_CASE: string = 'Vous devez déposer votre pièce sur une case vide!';

    public static readonly MUST_CHOOSE_OWN_PIECE_NOT_EMPTY: string = `vous avez sélectionné une case vide, vous devez sélectionner l'une de vos pièces.`;

    public static readonly CANNOT_PASS: string = 'Vous ne pouvez pas passer.';
}
