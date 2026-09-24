import { MGPOptional } from '@everyboard/lib';

import { BooleanConfig } from '../../../config/BooleanConfig';
import { NumberConfig } from '../../../config/NumberConfig';
import { RulesConfigDescription } from '../../../config/RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../../../config/RulesConfigDescriptionLocalizable';
import { MGPValidators } from '../../../utils/MGPValidator';
import { AbstractReversiRules, ReversiConfig } from '../common/AbstractReversiRules';

export class ToricReversiRules extends AbstractReversiRules {

    private static singleton: MGPOptional<ToricReversiRules> = MGPOptional.empty();

    public static get(): ToricReversiRules {
        if (ToricReversiRules.singleton.isAbsent()) {
            ToricReversiRules.singleton = MGPOptional.of(new ToricReversiRules());
        }
        return ToricReversiRules.singleton.get();
    }

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<ReversiConfig> =
        new RulesConfigDescription<ReversiConfig>({
            name: (): string => $localize`Toric Reversi`,
            config: {
                width: new NumberConfig(8, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(3, 99)),
                height: new NumberConfig(8, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(3, 99)),
                toric: new BooleanConfig(true, RulesConfigDescriptionLocalizable.TORIC),
            },
        });

    public override getRulesConfigDescription(): RulesConfigDescription<ReversiConfig> {
        return ToricReversiRules.RULES_CONFIG_DESCRIPTION;
    }

}
