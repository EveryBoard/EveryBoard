import { MGPOptional } from '@everyboard/lib';

import { BooleanConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from '../../../utils/MGPValidator';
import { AbstractReversiRules, ReversiConfig } from '../common/AbstractReversiRules';

export class ReversiRules extends AbstractReversiRules {

    private static singleton: MGPOptional<ReversiRules> = MGPOptional.empty();

    public static get(): ReversiRules {
        if (ReversiRules.singleton.isAbsent()) {
            ReversiRules.singleton = MGPOptional.of(new ReversiRules());
        }
        return ReversiRules.singleton.get();
    }

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<ReversiConfig> =
        new RulesConfigDescription<ReversiConfig>({
            name: (): string => $localize`Reversi`,
            config: {
                width: new NumberConfig(8, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(3, 99)),
                height: new NumberConfig(8, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(3, 99)),
                toric: new BooleanConfig(false, RulesConfigDescriptionLocalizable.TORIC),
            },
        });

    public override getRulesConfigDescription(): RulesConfigDescription<ReversiConfig> {
        return ReversiRules.RULES_CONFIG_DESCRIPTION;
    }

}
