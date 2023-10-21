import { GameNode } from 'src/app/jscaip/GameNode';
import { BrandhubState } from './BrandhubState';
import { TaflRules } from '../TaflRules';
import { BrandhubMove } from './BrandhubMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflConfig } from '../TaflConfig';
import { RulesConfigDescription } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';

export class BrandhubNode extends GameNode<BrandhubMove, BrandhubState> {}

export class BrandhubRules extends TaflRules<BrandhubMove, BrandhubState> {

    private static singleton: MGPOptional<BrandhubRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TaflConfig> = new RulesConfigDescription(
        {
            name: (): string => $localize`Brandhub`,
            config: {
                castleIsLeftForGood: true,
                edgesAreKingsEnnemy: false,
                centralThroneCanSurroundKing: true,
                kingFarFromHomeCanBeSandwiched: true,
                invaderStarts: true,
            },
        }, {
            castleIsLeftForGood: (): string => $localize`Central throne is left for good`,
            edgesAreKingsEnnemy: (): string => $localize`Edges are king's ennemy`,
            centralThroneCanSurroundKing: (): string => $localize`Central throne can surround king`,
            kingFarFromHomeCanBeSandwiched: (): string => $localize`King far from home can be sandwiched`,
            invaderStarts: (): string => $localize`Invader Starts`,
        });

    public static get(): BrandhubRules {
        if (BrandhubRules.singleton.isAbsent()) {
            BrandhubRules.singleton = MGPOptional.of(new BrandhubRules());
        }
        return BrandhubRules.singleton.get();
    }

    private constructor() {
        super(BrandhubState,
              BrandhubRules.RULES_CONFIG_DESCRIPTION.getDefaultConfig().config,
              BrandhubMove.from);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<TaflConfig> {
        return BrandhubRules.RULES_CONFIG_DESCRIPTION;
    }

}
