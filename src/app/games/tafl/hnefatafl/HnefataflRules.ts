import { MGPNode } from 'src/app/jscaip/MGPNode';
import { hnefataflConfig } from './hnefataflConfig';
import { HnefataflState } from './HnefataflState';
import { TaflRules } from '../TaflRules';
import { HnefataflMove } from './HnefataflMove';

export class HnefataflNode extends MGPNode<HnefataflRules, HnefataflMove, HnefataflState> {}

export class HnefataflRules extends TaflRules<HnefataflMove, HnefataflState> {

    private static singleton: HnefataflRules;

    public static get(): HnefataflRules {
        if (HnefataflRules.singleton == null) {
            HnefataflRules.singleton = new HnefataflRules();
        }
        MGPNode.ruler = this.singleton;
        return HnefataflRules.singleton;
    }
    private constructor() {
        super(HnefataflState, hnefataflConfig, HnefataflMove.of);
    }
}
