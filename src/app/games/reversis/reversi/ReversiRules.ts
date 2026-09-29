import { MGPOptional } from '@everyboard/lib';

import { EnumConfig } from '../../../components/wrapper-components/rules-configuration/EnumConfig';
import { NumberConfig } from '../../../components/wrapper-components/rules-configuration/NumberConfig';
import { RulesConfigDescription } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescriptionLocalizable';
import { MGPValidators } from '../../../utils/MGPValidator';
import { TopologicReversiRules, ReversiConfig, TopologyNamer, Shapes } from '../common/AbstractReversiRules';

export class ReversiRules extends TopologicReversiRules {

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
                boardSize: new NumberConfig(8, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 100)),
                topology: new EnumConfig('SQUARE (8)', () => $localize`Space shape`, TopologyNamer),
                shape: new EnumConfig('SQUARE', () => $localize`Board shape`, Shapes),
            },
        });

    public override getRulesConfigDescription(): RulesConfigDescription<ReversiConfig> {
        return ReversiRules.RULES_CONFIG_DESCRIPTION;
    }

}
