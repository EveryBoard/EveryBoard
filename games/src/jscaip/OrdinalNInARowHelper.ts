import { NInARowHelper } from './NInARowHelper';
import { Ordinal } from './Ordinal';

export class OrdinalNInARowHelper<T extends NonNullable<unknown>> extends NInARowHelper<T, Ordinal> {

    private readonly ordinals: ReadonlyArray<Ordinal> = Ordinal.ORDINALS;

    protected override getDirections(): ReadonlyArray<Ordinal> {
        return this.ordinals;
    }

}
