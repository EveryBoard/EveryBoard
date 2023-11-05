import { GameNode } from 'src/app/jscaip/GameNode';
import { TablutMove } from './TablutMove';
import { TablutState } from './TablutState';
import { TaflRules } from '../TaflRules';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflConfig } from '../TaflConfig';
import { RulesConfigDescription } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';

export class TablutNode extends GameNode<TablutMove, TablutState> {}

export class TablutRules extends TaflRules<TablutMove, TablutState> {

    private static singleton: MGPOptional<TablutRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TaflConfig> =
        new RulesConfigDescription(
            {
                name: (): string => $localize`Tablut`,
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

    public static get(): TablutRules {
        if (TablutRules.singleton.isAbsent()) {
            TablutRules.singleton = MGPOptional.of(new TablutRules());
        }
        return TablutRules.singleton.get();
    }

    private constructor() {
        super(TablutState, TablutMove.from);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<TaflConfig> {
        return TablutRules.RULES_CONFIG_DESCRIPTION;
    }

}
