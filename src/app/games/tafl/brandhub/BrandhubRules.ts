import { MGPNode } from 'src/app/jscaip/MGPNode';
import { brandhubConfig } from './brandhubConfig';
import { BrandhubState } from './BrandhubState';
import { TaflRules } from '../TaflRules';
import { BrandhubMove } from './BrandhubMove';

export class BrandhubNode extends MGPNode<BrandhubRules, BrandhubMove, BrandhubState> {}

export class BrandhubRules extends TaflRules<BrandhubMove, BrandhubState> {

    private static singleton: BrandhubRules;

    public static get(): BrandhubRules {
        if (BrandhubRules.singleton == null) {
            BrandhubRules.singleton = new BrandhubRules();
        }
        MGPNode.ruler = this.singleton;
        return BrandhubRules.singleton;
    }
    private constructor() {
        super(BrandhubState, brandhubConfig, BrandhubMove.of);
    }
}
