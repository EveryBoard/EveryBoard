import { GameNode } from 'src/app/jscaip/GameNode';
import { HnefataflState } from './HnefataflState';
import { TaflRules } from '../TaflRules';
import { HnefataflMove } from './HnefataflMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflConfig } from '../TaflConfig';

export class HnefataflNode extends GameNode<HnefataflMove, HnefataflState> {}

export class HnefataflRules extends TaflRules<HnefataflMove, HnefataflState> {

    private static singleton: MGPOptional<HnefataflRules> = MGPOptional.empty();

    public static readonly DEFAULT_CONFIG: TaflConfig = {
        castleIsLeftForGood: false,
        edgesAreKingsEnnemy: true,
        centralThroneCanSurroundKing: false,
        kingFarFromHomeCanBeSandwiched: false,
        invaderStarts: true,
    };

    public static get(): HnefataflRules {
        if (HnefataflRules.singleton.isAbsent()) {
            HnefataflRules.singleton = MGPOptional.of(new HnefataflRules());
        }
        return HnefataflRules.singleton.get();
    }
    private constructor() {
        super(HnefataflState, HnefataflRules.DEFAULT_CONFIG, HnefataflMove.from);
    }
}
