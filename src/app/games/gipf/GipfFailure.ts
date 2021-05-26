/* eslint-disable max-len */
export class GipfFailure {

    public static readonly CAPTURE_MUST_BE_ALIGNED: string = `Une capture ne peut que se faire si 4 pièces de votre couleurs sont alignées, ce n'est pas le cas.`;

    public static readonly INVALID_CAPTURED_PIECES: string = `Veuillez choisir une capture valide qui contient 4 pièces ou plus.`;

    public static readonly MISSING_CAPTURES: string = `Il vous reste des captures à effectuer.`;

    public static readonly PLACEMENT_NOT_ON_BORDER: string = 'Les pièces doivent être placée sur une case du bord du plateau.';

    public static readonly INVALID_PLACEMENT_DIRECTION: string = `Veuillez choisir une direction valide pour le déplacement.`;

    public static readonly PLACEMENT_WITHOUT_DIRECTION: string = 'Veuillez choisir un placement avec une direction.';

    public static readonly PLACEMENT_ON_COMPLETE_LINE: string = 'Veuillez effectuer un placement sur une ligne non complète.';

    public static readonly AMBIGUOUS_CAPTURE_COORD: string = `Veuillez sélectionner une autre case de la capture que vous souhaitez prendre, celle-ci appartient à deux captures.`;

    public static readonly NOT_PART_OF_CAPTURE: string = `Veuillez sélectionner une capture.`;

    public static readonly CLICK_FURTHER_THAN_ONE_COORD: string = `Veuillez sélectionner une destination à une distance de 1 de l'entrée.`;

    public static readonly NO_DIRECTIONS_AVAILABLE: string = `Veuillez sélectionner une autre case, toutes les lignes pour ce placement sont complètes.`;
}
