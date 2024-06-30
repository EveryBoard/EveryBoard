import { MGPOptional } from 'lib/dist';
import { AbstractGoRules } from '../AbstractGoRules';
import { GoState } from '../GoState';
import { GoPiece } from '../GoPiece';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { NumberConfig, RulesConfigDescription, RulesConfigDescriptionLocalizable } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { MGPValidators } from 'src/app/utils/MGPValidator';
import { TableUtils } from 'src/app/jscaip/TableUtils';
import { TriangularGoGroupDataFactory } from '../GoGroupDataFactory';
import { GroupDataFactory } from 'src/app/jscaip/BoardData';

export type TrigoConfig = {
    size: number;
};

export class TrigoRules extends AbstractGoRules<TrigoConfig> {

    private static singleton: MGPOptional<TrigoRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TrigoConfig> =
        new RulesConfigDescription<TrigoConfig>({
            name: (): string => $localize`Standard`,
            config: {
                size: new NumberConfig(7,
                                       RulesConfigDescriptionLocalizable.SIZE,
                                       MGPValidators.range(1, 99)),
            },
        });

    public static get(): TrigoRules {
        if (TrigoRules.singleton.isAbsent()) {
            TrigoRules.singleton = MGPOptional.of(new TrigoRules());
        }
        return TrigoRules.singleton.get();
    }

    public override getInitialState(optionalConfig: MGPOptional<TrigoConfig>): GoState {
        const config: TrigoConfig = optionalConfig.get();
        const width: number = (config.size * 2) - (config.size % 2);
        const board: GoPiece[][] = TableUtils.create(
            width,
            config.size,
            GoPiece.UNREACHABLE,
        );
        const lineStartIndex: number = config.size - (config.size % 2);
        for (let y: number = 0; y < config.size; y++) {
            const lineEndIndex: number = lineStartIndex + (y * 2);
            for (let x: number = 0; x < width; x++) {
                const diagonalIndex: number = x + y;
                if (lineStartIndex <= diagonalIndex && diagonalIndex <= lineEndIndex) {
                    board[y][x] = GoPiece.EMPTY;
                }
            }
        }
        return new GoState(board, PlayerNumberMap.of(0, 0), 0, MGPOptional.empty(), 'PLAYING');
    }

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<TrigoConfig>> {
        return MGPOptional.of(TrigoRules.RULES_CONFIG_DESCRIPTION);
    }

    public override getGoGroupDataFactory(): GroupDataFactory<GoPiece> {
        return new TriangularGoGroupDataFactory();
    }

}
