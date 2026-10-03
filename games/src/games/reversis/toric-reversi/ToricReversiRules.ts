import { MGPOptional } from '@everyboard/lib';

import { EnumConfig } from '../../../config/EnumConfig';
import { NumberConfig } from '../../../config/NumberConfig';
import { RulesConfigDescription } from '../../../config/RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../../../config/RulesConfigDescriptionLocalizable';
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
