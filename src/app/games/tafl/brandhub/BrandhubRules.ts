import { GameNode } from 'src/app/jscaip/GameNode';
import { brandhubConfig } from './brandhubConfig';
import { BrandhubState } from './BrandhubState';
import { TaflRules } from '../TaflRules';
import { BrandhubMove } from './BrandhubMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class BrandhubNode extends GameNode<BrandhubMove, BrandhubState> {}

export class BrandhubRules extends TaflRules<BrandhubMove, BrandhubState> {

    private static singleton: MGPOptional<BrandhubRules> = MGPOptional.empty();

    public static get(): BrandhubRules {
        if (BrandhubRules.singleton.isAbsent()) {
            BrandhubRules.singleton = MGPOptional.of(new BrandhubRules());
        }
        return BrandhubRules.singleton.get();
    }

    private constructor() {
        super(brandhubConfig, BrandhubMove.from);
    }

    public getInitialState(): BrandhubState {
        return BrandhubState.getInitialState();
    }
}
