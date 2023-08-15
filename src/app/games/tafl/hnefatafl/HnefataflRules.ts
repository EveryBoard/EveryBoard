import { GameNode } from 'src/app/jscaip/GameNode';
import { hnefataflConfig } from './hnefataflConfig';
import { HnefataflState } from './HnefataflState';
import { TaflRules } from '../TaflRules';
import { HnefataflMove } from './HnefataflMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';

export class HnefataflNode extends GameNode<HnefataflMove, HnefataflState> {}

export class HnefataflRules extends TaflRules<HnefataflMove, HnefataflState> {

    private static singleton: MGPOptional<HnefataflRules> = MGPOptional.empty();

    public static get(): HnefataflRules {
        if (HnefataflRules.singleton.isAbsent()) {
            HnefataflRules.singleton = MGPOptional.of(new HnefataflRules());
        }
        return HnefataflRules.singleton.get();
    }
    private constructor() {
        super(HnefataflState, hnefataflConfig, HnefataflMove.from);
    }
}
