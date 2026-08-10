import { Localized } from '../../../utils/LocaleUtils';

export class ScoreName {

    public static readonly POINTS: ScoreName =
        new ScoreName(() => $localize`0 points`,
                      () => $localize`1 point`,
                      (n: number) => $localize`${n} points`);

    public static readonly CAPTURES: ScoreName =
        new ScoreName(() => $localize`0 captures`,
                      () => $localize`1 capture`,
                      (n: number) => $localize`${n} captures`);

    public static readonly REMAINING_PIECES: ScoreName =
        new ScoreName(() => $localize`0 remaining pieces`,
                      () => $localize`1 remaining piece`,
                      (n: number) => $localize`${n} remaining pieces`);

    public static readonly PIECES_TO_DROP: ScoreName =
        new ScoreName(() => $localize`0 pieces to drop`,
                      () => $localize`1 piece to drop`,
                      (n: number) => $localize`${n} pieces to drop`);

    public static readonly PROTECTED_PIECES: ScoreName =
        new ScoreName(() => $localize`0 protected pieces`,
                      () => $localize`1 protected piece`,
                      (n: number) => $localize`${n} protected pieces`);

    public static readonly PIECES_UNDER_CONTROL: ScoreName =
        new ScoreName(() => $localize`0 pieces under control`,
                      () => $localize`1 piece under control`,
                      (n: number) => $localize`${n} pieces under control`);

    public static readonly STACKS_UNDER_CONTROL: ScoreName =
        new ScoreName(() => $localize`0 stacks under control`,
                      () => $localize`1 stack under control`,
                      (n: number) => $localize`${n} stacks under control`);

    /**
     * A score name might be differently written for zero, one, or more than one "points".
     * Zero might be plural like in english, but different in another language, like french where it is singular.
     */
    private constructor(public readonly zero: Localized,
                        public readonly singular: Localized,
                        public readonly plural: (n: number) => string) {
    }

    public getString(count: number): string {
        switch (count) {
            case 0:
                return this.zero();
            case 1:
                return this.singular();
            default:
                return this.plural(count);
        }
    }
}
// TODO VON JAJA