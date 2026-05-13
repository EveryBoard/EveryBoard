import { MGPOptional } from '@everyboard/lib';

import { BooleanConfig, NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from '../../../utils/MGPValidator';
import { AbstractCheckersRules, CheckersConfig, CheckersOptionLocalizable } from '../common/AbstractCheckersRules';

export class LascaRules extends AbstractCheckersRules {

    private static singleton: MGPOptional<LascaRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<CheckersConfig> =
        new RulesConfigDescription<CheckersConfig>({
            name: (): string => $localize`Lasca`,
            config: {
                playerRows: new NumberConfig(3,
                                             RulesConfigDescriptionLocalizable.NUMBER_OF_PIECES_ROWS,
                                             MGPValidators.range(1, 99)),
                emptyRows: new NumberConfig(1,
                                            RulesConfigDescriptionLocalizable.NUMBER_OF_EMPTY_ROWS,
                                            MGPValidators.range(1, 99)),
                width: new NumberConfig(7, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(2, 99)),
                canStackPieces:
                    new BooleanConfig(true, CheckersOptionLocalizable.STACK_PIECES),
                mustMakeMaximalCapture:
                    new BooleanConfig(false, CheckersOptionLocalizable.MAXIMAL_CAPTURE),
                simplePieceCanCaptureBackwards:
                    new BooleanConfig(false, CheckersOptionLocalizable.SIMPLE_PIECE_CAN_CAPTURE_BACKWARDS),
                promotedPiecesCanFly:
                    new BooleanConfig(false, CheckersOptionLocalizable.PROMOTED_PIECES_CAN_TRAVEL_LONG_DISTANCES),
                occupyEvenSquare:
                    new BooleanConfig(true, CheckersOptionLocalizable.OCCUPY_EVEN_SQUARE),
                frisianCaptureAllowed:
                    new BooleanConfig(false, CheckersOptionLocalizable.FRISIAN_CAPTURE_ALLOWED),
                canPromoteMidCapture:
                    new BooleanConfig(false, CheckersOptionLocalizable.CAN_PROMOTE_MID_CAPTURE),
                allowPathCrossing:
                    new BooleanConfig(true, CheckersOptionLocalizable.ALLOW_PATH_CROSSING),
            },
        });

    public static get(): LascaRules {
        if (LascaRules.singleton.isAbsent()) {
            LascaRules.singleton = MGPOptional.of(new LascaRules());
        }
        return LascaRules.singleton.get();
    }

    public override getRulesConfigDescription(): RulesConfigDescription<CheckersConfig> {
        return LascaRules.RULES_CONFIG_DESCRIPTION;
    }

}
