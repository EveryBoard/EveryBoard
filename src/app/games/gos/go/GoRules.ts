import { MGPOptional } from '@everyboard/lib';

import { NumberConfig } from '../../../components/wrapper-components/rules-configuration/NumberConfig';
import { RulesConfigDescription } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescriptionLocalizable';
import { Coord } from '../../../jscaip/Coord';
import { GobanConfig } from '../../../jscaip/GobanConfig';
import { GobanUtils } from '../../../jscaip/GobanUtils';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { MGPValidators } from '../../../utils/MGPValidator';
import { AbstractGoRules } from '../AbstractGoRules';
import { GoGroupDataFactory, OrthogonalGoGroupDataFactory } from '../GoGroupDataFactory';
import { GoPhase } from '../GoPhase';
import { GoPiece } from '../GoPiece';
import { GoState } from '../GoState';

export type GoConfig = GobanConfig & {

    handicap: number;
};

export class GoRules extends AbstractGoRules<GoConfig> {

    private static singleton: MGPOptional<GoRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<GoConfig> =
        new RulesConfigDescription<GoConfig>({
            name: (): string => $localize`19 x 19`,
            config: {
                width: new NumberConfig(19, RulesConfigDescriptionLocalizable.WIDTH, MGPValidators.range(1, 99)),
                height: new NumberConfig(19, RulesConfigDescriptionLocalizable.HEIGHT, MGPValidators.range(1, 99)),
                handicap: new NumberConfig(0, () => $localize`Handicap`, MGPValidators.range(0, 9)),
            },
        }, [{
            name: (): string => $localize`13 x 13`,
            config: {
                width: 13,
                height: 13,
                handicap: 0,
            },
        }, {
            name: (): string => $localize`9 x 9`,
            config: {
                width: 9,
                height: 9,
                handicap: 0,
            },
        }]);

    public static get(): GoRules {
        if (GoRules.singleton.isAbsent()) {
            GoRules.singleton = MGPOptional.of(new GoRules());
        }
        return GoRules.singleton.get();
    }

    public constructor() {
        super(true);
    }

    public override getInitialState(config: GoConfig): GoState {
        const board: GoPiece[][] = GoState.getStartingBoard(config.width, config.height);
        let turn: number = 0;
        const left: number = GobanUtils.getHorizontalLeft(config.width);
        const right: number = GobanUtils.getHorizontalRight(config.width);
        const up: number = GobanUtils.getVerticalUp(config.height);
        const down: number = GobanUtils.getVerticalDown(config.height);
        const horizontalCenter: number = GobanUtils.getHorizontalCenter(config.width);
        const verticalCenter: number = GobanUtils.getVerticalCenter(config.height);
        const orderedHandicaps: Coord[] = [
            new Coord(left, up),
            new Coord(right, down),
            new Coord(right, up),
            new Coord(left, down),
            new Coord(horizontalCenter, verticalCenter),
            new Coord(horizontalCenter, up),
            new Coord(horizontalCenter, down),
            new Coord(left, verticalCenter),
            new Coord(right, verticalCenter),
        ];
        if (1 <= config.handicap) {
            turn = 1;
        }
        for (let i: number = 0; i < config.handicap; i++) {
            const handicapToPut: Coord = orderedHandicaps[i];
            board[handicapToPut.y][handicapToPut.x] = GoPiece.DARK;
        }
        return new GoState(board, PlayerNumberMap.of(0, 0), turn, MGPOptional.empty(), GoPhase.PLAYING);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<GoConfig> {
        return GoRules.RULES_CONFIG_DESCRIPTION;
    }

    public override getGoGroupDataFactory(): GoGroupDataFactory {
        return new OrthogonalGoGroupDataFactory();
    }

}
