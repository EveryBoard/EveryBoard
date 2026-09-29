import { MGPOptional } from '@everyboard/lib';

import { EnumConfig } from '../../../components/wrapper-components/rules-configuration/EnumConfig';
import { NumberConfig } from '../../../components/wrapper-components/rules-configuration/NumberConfig';
import { RulesConfigDescription } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescriptionLocalizable';
import { MGPValidators } from '../../../utils/MGPValidator';
import { TopologicReversiRules, ReversiConfig, Shapes, TopologyNamer } from '../common/AbstractReversiRules';

export class ToricReversiRules extends TopologicReversiRules {

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
                boardSize: new NumberConfig(8, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 100)),
                topology: new EnumConfig('SQUARE (8)', () => $localize`Space shape`, TopologyNamer),
                shape: new EnumConfig('TORUS', () => $localize`Board shape`, Shapes),
            },
        });

    public override getRulesConfigDescription(): RulesConfigDescription<ReversiConfig> {
        return ToricReversiRules.RULES_CONFIG_DESCRIPTION;
    }

}
