import { MGPOptional } from '@everyboard/lib';

import { EnumConfig } from '../../../config/EnumConfig';
import { NumberConfig } from '../../../config/NumberConfig';
import { RulesConfigDescription } from '../../../config/RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../../../config/RulesConfigDescriptionLocalizable';
import { MGPValidators } from '../../../utils/MGPValidator';
import { TopologicReversiRules, ReversiConfig, ReversiTopologyNamer, ReversiShapes } from '../common/AbstractReversiRules';

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
                topology: new EnumConfig('SQUARE (8)', () => $localize`Space shape`, ReversiTopologyNamer),
                shape: new EnumConfig('SQUARE', () => $localize`Board shape`, ReversiShapes),
            },
        });

    public getRulesConfigDescription(): RulesConfigDescription<ReversiConfig> {
        return ReversiRules.RULES_CONFIG_DESCRIPTION;
    }

}
