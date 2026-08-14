import { TableUtils } from '@everyboard/games';
import { PlayerNumberMap } from '@everyboard/games';
import { RulesConfig } from '@everyboard/games';
import { MGPOptional } from '@everyboard/lib';

import { NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from '../../../utils/MGPValidator';
import { AbstractGoRules } from '../AbstractGoRules';
import { GoGroupDataFactory, HexagonalGoGroupDataFactory } from '../GoGroupDataFactory';
import { GoPhase } from '../GoPhase';
import { GoPiece } from '../GoPiece';
import { GoState } from '../GoState';

export type HexagonalGoConfig = RulesConfig & {

    size: number;

};

export class HexagonalGoRules extends AbstractGoRules<HexagonalGoConfig> {

    private static singleton: MGPOptional<HexagonalGoRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<HexagonalGoConfig> =
        new RulesConfigDescription<HexagonalGoConfig>({
            name: (): string => $localize`Standard`,
            config: {
                size: new NumberConfig(
                    7,
                    RulesConfigDescriptionLocalizable.SIZE,
                    MGPValidators.range(1, 99)),
            },
        });

    public static get(): HexagonalGoRules {
        if (HexagonalGoRules.singleton.isAbsent()) {
            HexagonalGoRules.singleton = MGPOptional.of(new HexagonalGoRules());
        }
        return HexagonalGoRules.singleton.get();
    }

    public constructor() {
        super(false);
    }

    public override getInitialState(config: HexagonalGoConfig): GoState {
        const size: number = config.size;
        const boardSize: number = (size * 2) - 1;
        const maximumDiagonalIndex: number = (3 * size) - 2;
        const board: GoPiece[][] = TableUtils.create(boardSize, boardSize, GoPiece.UNREACHABLE);
        for (let y: number = 0; y < boardSize; y++) {
            for (let x: number = 0; x < boardSize; x++) {
                const diagonalIndex: number = x + y;
                if (size - 2 < diagonalIndex && diagonalIndex < maximumDiagonalIndex) {
                    board[y][x] = GoPiece.EMPTY;
                }
            }
        }
        return new GoState(board, PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), GoPhase.PLAYING);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<HexagonalGoConfig> {
        return HexagonalGoRules.RULES_CONFIG_DESCRIPTION;
    }

    public override getGoGroupDataFactory(): GoGroupDataFactory {
        return new HexagonalGoGroupDataFactory();
    }

}
