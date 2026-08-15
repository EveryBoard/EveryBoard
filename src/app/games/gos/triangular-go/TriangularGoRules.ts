
import { BooleanConfig } from 'src/app/components/wrapper-components/rules-configuration/BooleanConfig';
import { NumberConfig } from 'src/app/components/wrapper-components/rules-configuration/NumberConfig';
import { RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescriptionLocalizable';

import { MGPOptional } from '@everyboard/lib';

import { RulesConfigDescription } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { HexagonalUtils } from '../../../jscaip/HexagonalUtils';
import { PlayerNumberMap } from '../../../jscaip/PlayerMap';
import { RulesConfig } from '../../../jscaip/RulesConfigUtil';
import { TriangularCheckerBoard } from '../../../jscaip/state/TriangularCheckerBoard';
import { MGPValidators } from '../../../utils/MGPValidator';
import { AbstractGoRules } from '../AbstractGoRules';
import { GoGroupDataFactory, TriangularGoGroupDataFactory } from '../GoGroupDataFactory';
import { GoPhase } from '../GoPhase';
import { GoPiece } from '../GoPiece';
import { GoState } from '../GoState';

export type TriangularGoConfig = RulesConfig & {

    size: number;

    hexagonal: boolean;

};

export class TriangularGoRules extends AbstractGoRules<TriangularGoConfig> {

    private static singleton: MGPOptional<TriangularGoRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TriangularGoConfig> =
        new RulesConfigDescription<TriangularGoConfig>({
            name: (): string => $localize`Standard`,
            config: {
                size: new NumberConfig(7, RulesConfigDescriptionLocalizable.SIZE, MGPValidators.range(1, 99)),
                hexagonal: new BooleanConfig(false, () => $localize`Hexagonal`),
            },
        });

    public static get(): TriangularGoRules {
        if (TriangularGoRules.singleton.isAbsent()) {
            TriangularGoRules.singleton = MGPOptional.of(new TriangularGoRules());
        }
        return TriangularGoRules.singleton.get();
    }

    public constructor() {
        super(false);
    }

    public override getInitialState(config: TriangularGoConfig): GoState {
        const size: number = config.size;
        let board: GoPiece[][];
        if (config.hexagonal) {
            board = HexagonalUtils.createBoard(size, GoPiece.UNREACHABLE, GoPiece.EMPTY);
        } else {
            board = TriangularCheckerBoard.createBoard(size, GoPiece.UNREACHABLE, GoPiece.EMPTY);
        }
        return new GoState(board, PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<TriangularGoConfig> {
        return TriangularGoRules.RULES_CONFIG_DESCRIPTION;
    }

    public override getGoGroupDataFactory(): GoGroupDataFactory {
        return new TriangularGoGroupDataFactory();
    }

}
