export { Set } from '@everyboard/lib';

import { NInARowHelper } from './NInARowHelper';
import { Ordinal } from './Ordinal';

export class OrdinalNInARowHelper<T extends NonNullable<unknown>> extends NInARowHelper<T, Ordinal> {

    private readonly ordinals: Set<Ordinal> = new Set(Ordinal.ORDINALS);

    protected override getDirections(): Set<Ordinal> {
        return this.ordinals;
    }

}
