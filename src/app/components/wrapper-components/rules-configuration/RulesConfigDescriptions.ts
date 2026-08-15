import { GobanConfig } from 'src/app/jscaip/GobanConfig';
import { MGPValidators } from 'src/app/utils/MGPValidator';
import { NumberConfig } from './NumberConfig';
import { RulesConfigDescription } from './RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from './RulesConfigDescriptionLocalizable';


export class RulesConfigDescriptions {

    public static readonly GOBAN: RulesConfigDescription<GobanConfig> = new RulesConfigDescription<GobanConfig>({
        name: (): string => $localize`Default`,
        config: {
            width: new NumberConfig(19, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
            height: new NumberConfig(19, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(1, 99)),
        },
    });

}
