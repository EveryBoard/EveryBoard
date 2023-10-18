import { GameNode } from 'src/app/jscaip/GameNode';
import { BrandhubState } from './BrandhubState';
import { TaflRules } from '../TaflRules';
import { BrandhubMove } from './BrandhubMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflConfig } from '../TaflConfig';

export class BrandhubNode extends GameNode<BrandhubMove, BrandhubState> {}

export class BrandhubRules extends TaflRules<BrandhubMove, BrandhubState> {

    private static singleton: MGPOptional<BrandhubRules> = MGPOptional.empty();

    public static readonly DEFAULT_CONFIG: TaflConfig = {
        castleIsLeftForGood: true,
        edgesAreKingsEnnemy: false,
        centralThroneCanSurroundKing: true,
        kingFarFromHomeCanBeSandwiched: true,
        invaderStarts: true,
    };

    public static get(): BrandhubRules {
        if (BrandhubRules.singleton.isAbsent()) {
            BrandhubRules.singleton = MGPOptional.of(new BrandhubRules());
        }
        return BrandhubRules.singleton.get();
    }
    private constructor() {
        super(BrandhubState, BrandhubRules.DEFAULT_CONFIG, BrandhubMove.from);
    }
}
