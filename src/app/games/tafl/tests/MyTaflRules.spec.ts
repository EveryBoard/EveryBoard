/* eslint-disable max-lines-per-function */
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflNode, TaflRules } from '../TaflRules';
import { MyTaflMove } from './MyTaflMove.spec';
import { MyTaflState } from './MyTaflState.spec';
import { TaflConfig } from '../TaflConfig';
import { RulesConfigDescription } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';

export class MyTaflNode extends TaflNode<MyTaflMove, MyTaflState> {}

export class MyTaflRules extends TaflRules<MyTaflMove, MyTaflState> {

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TaflConfig> =
        new RulesConfigDescription(
            {
                name: (): string => $localize`Brandhub`,
                config: {
                    castleIsLeftForGood: true,
                    invaderStarts: true,
                    kingFarFromHomeCanBeSandwiched: true,
                    centralThroneCanSurroundKing: true,
                    edgesAreKingsEnnemy: true,
                },
            }, {
                castleIsLeftForGood: (): string => $localize`Central throne is left for good`,
                edgesAreKingsEnnemy: (): string => $localize`Edges are king's ennemy`,
                centralThroneCanSurroundKing: (): string => $localize`Central throne can surround king`,
                kingFarFromHomeCanBeSandwiched: (): string => $localize`King far from home can be sandwiched`,
                invaderStarts: (): string => $localize`Invader starts`,
            });

    private static singleton: MGPOptional<MyTaflRules> = MGPOptional.empty();

    public static get(): MyTaflRules {
        if (MyTaflRules.singleton.isAbsent()) {
            MyTaflRules.singleton = MGPOptional.of(new MyTaflRules());
        }
        return MyTaflRules.singleton.get();
    }

    private constructor() {
        super(MyTaflState, MyTaflMove.from);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<TaflConfig> {
        return MyTaflRules.RULES_CONFIG_DESCRIPTION;
    }
}
