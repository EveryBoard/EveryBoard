import { GipfFailure } from '../gipf/GipfFailure';

export class YinshFailure {
    public static readonly PLACEMENT_AFTER_INITIAL_PHASE: string = $localize`You cannot perform a placement after turn 10.`;

    public static readonly MISSING_CAPTURES: string = GipfFailure.MISSING_CAPTURES;

    public static readonly CAPTURE_MUST_BE_ALIGNED: string = GipfFailure.CAPTURE_MUST_BE_ALIGNED;

    public static readonly INVALID_CAPTURED_PIECES: string = $localize`Veuillez choisir une capture valide qui contient 5 pièces ou plus.`;

    public static readonly CAN_ONLY_CAPTURE_YOUR_MARKERS: string = $localize`Vous ne pouvez que capturer vos propres marqueurs.`;

    public static readonly HOLES_IN_CAPTURE: string = $localize`Les pièces capturées doivent être consécutives: votre capture contient un trou.`;

    public static readonly SHOULD_SELECT_PLAYER_RING: string = $localize`Vous devez choisir un de vos anneaux à déplacer.`;

    public static readonly SHOULD_END_MOVE_ON_EMPTY_CASE: string = $localize`Vous devez terminer votre mouvement sur une case vide.`;

    public static readonly MOVE_SHOULD_PASS_ABOVE_MARKERS_ONLY: string = $localize`Un anneau ne peut passer qu'au dessus des marqueurs, pas au dessus d'un autre anneau ou d'une case vide.`;

    public static readonly AMBIGUOUS_CAPTURE_COORD: string = GipfFailure.AMBIGUOUS_CAPTURE_COORD;

    public static readonly NOT_PART_OF_CAPTURE: string = GipfFailure.NOT_PART_OF_CAPTURE;

    private constructor() {}
}
