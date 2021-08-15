import { GipfFailure } from '../gipf/GipfFailure';

export class YinshFailure {
    public static readonly PLACEMENT_AFTER_INITIAL_PHASE: string = $localize`Vous ne pouvez pas placer d'anneau sans placer de marqueurs après le dixième tour.`;

    public static readonly NO_MARKERS_IN_INITIAL_PHASE: string = $localize`Vous ne pouvez pas placer vos marqueurs avant d'avoir placé tous vos anneaux.`;

    public static readonly MISSING_CAPTURES: string = GipfFailure.MISSING_CAPTURES;

    public static readonly MOVE_DIRECTION_INVALID: string = $localize`La direction de votre mouvement est invalide: un mouvement se fait le long d'une ligne droite.`

    public static readonly CAPTURE_MUST_BE_ALIGNED: string = GipfFailure.CAPTURE_MUST_BE_ALIGNED;

    public static readonly INVALID_CAPTURED_PIECES: string = $localize`Veuillez choisir une capture valide qui contient exactement 5 marqueurs.`;

    public static readonly CAN_ONLY_CAPTURE_YOUR_MARKERS: string = $localize`Vous ne pouvez que capturer vos propres marqueurs.`;

    public static readonly HOLES_IN_CAPTURE: string = $localize`Les marqueurs capturés doivent être consécutifs: votre capture contient un trou.`;

    public static readonly SHOULD_SELECT_PLAYER_RING: string = $localize`Vous devez choisir un de vos propres anneaux à déplacer.`;

    public static readonly SHOULD_END_MOVE_ON_EMPTY_CASE: string = $localize`Vous devez terminer votre mouvement sur une case vide.`;

    public static readonly MOVE_SHOULD_NOT_PASS_ABOVE_RING: string = $localize`Un anneau ne peut passer qu'au dessus des marqueurs ou de cases vides, pas au dessus d'un autre anneau.`;

    public static readonly MOVE_SHOULD_END_AT_FIRST_EMPTY_CASE_AFTER_MARKERS: string = $localize`Votre déplacement doit s'arrêter à la première case vide après un groupe de marqueurs.`;

    public static readonly AMBIGUOUS_CAPTURE_COORD: string = GipfFailure.AMBIGUOUS_CAPTURE_COORD;

    public static readonly NOT_PART_OF_CAPTURE: string = GipfFailure.NOT_PART_OF_CAPTURE;

    public static readonly INVALID_CAPTURE: string = $localize`Une capture doit se composer d'exactement 5 marqueurs.`;

    public static readonly CAPTURE_SHOULD_TAKE_RING: string = $localize`Quand vous capturez des marqueurs, vous devez reprendre l'un de vos anneaux en cliquant dessus.`;

}
