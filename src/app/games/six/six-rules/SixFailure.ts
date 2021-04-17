/* eslint-disable max-len */
export class SixFailure {

    public static readonly NO_DEPLACEMENT_BEFORE_TURN_40: string = 'Vous ne pouvez pas encore effectuer de déplacement. Choisissez une case où déposer une pièce.';

    public static readonly MUST_CUT: string = 'Several groups are of same size, you must pick the one to keep!';

    public static readonly CANNOT_CHOOSE_TO_KEEP: string = 'You cannot choose which part to keep when one is smaller than the other!';

    public static readonly CAN_NO_LONGER_DROP: string = 'Vous ne pouvez plus déposer de pièces, choisissez d\'abord une pièce à déplacer!';

    public static readonly MUST_CAPTURE_BIGGEST_GROUPS: string = 'Vous devez choisir un des plus grands groupes pour le conserver!';

    public static readonly CANNOT_KEEP_EMPTY_COORD: string = 'Vous ne pouver choisir une pièce vide, choisissez un des plus grands groupes!';

    private constructor() {}
}
