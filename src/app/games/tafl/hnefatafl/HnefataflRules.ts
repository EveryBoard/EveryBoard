import { GameNode } from 'src/app/jscaip/GameNode';
import { HnefataflState } from './HnefataflState';
import { TaflRules } from '../TaflRules';
import { HnefataflMove } from './HnefataflMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflConfig } from '../TaflConfig';
import { RulesConfigDescription } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';

export class HnefataflNode extends GameNode<HnefataflMove, HnefataflState> {}

export class HnefataflRules extends TaflRules<HnefataflMove, HnefataflState> {

    private static singleton: MGPOptional<HnefataflRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TaflConfig> = new RulesConfigDescription(
        {
            name: (): string => $localize`Hnefatafl`,
            config: {
                castleIsLeftForGood: false,
                edgesAreKingsEnnemy: true,
                centralThroneCanSurroundKing: false,
                kingFarFromHomeCanBeSandwiched: false,
                invaderStarts: true,
            },
        }, {
            castleIsLeftForGood: (): string => $localize`Central throne is left for good`,
            edgesAreKingsEnnemy: (): string => $localize`Edges are king's ennemy`,
            centralThroneCanSurroundKing: (): string => $localize`Central throne can surround king`,
            kingFarFromHomeCanBeSandwiched: (): string => $localize`King far from home can be sandwiched`,
            invaderStarts: (): string => $localize`Invader starts`,
        });

    public static get(): HnefataflRules {
        if (HnefataflRules.singleton.isAbsent()) {
            HnefataflRules.singleton = MGPOptional.of(new HnefataflRules());
        }
        return HnefataflRules.singleton.get();
    }
    private constructor() {
        super(HnefataflState, HnefataflMove.from);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<TaflConfig> {
        return HnefataflRules.RULES_CONFIG_DESCRIPTION;
    }

}
