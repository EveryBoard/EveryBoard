// TODO: yes or non ?
export class RulesConfigDescriptionLocalizable {

    public static readonly WIDTH: () => string = (): string => $localize`Width`;

    public static readonly HEIGHT: () => string = (): string => $localize`Height`;

    public static readonly SIZE: () => string = (): string => $localize`Size`;

    public static readonly ALIGNMENT_SIZE: () => string = () => $localize`Number of aligned pieces needed to win`;

    public static readonly NUMBER_OF_DROPS: () => string = () => $localize`Number of pieces dropped per turn`;

    public static readonly NUMBER_OF_EMPTY_ROWS: () => string = () => $localize`Number of empty rows`;

    public static readonly NUMBER_OF_PIECES_ROWS: () => string = () => $localize`Number of pieces rows`;

    public static readonly TORIC: () => string = () => $localize`Toric`;

}
