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

export type TriGoConfig = {
    size: number;
};

export class TriGoRules extends AbstractGoRules<TriGoConfig> {

    private static singleton: MGPOptional<TriGoRules> = MGPOptional.empty();

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TriGoConfig> =
        new RulesConfigDescription<TriGoConfig>({
            name: (): string => $localize`Standard`,
            config: {
                size: new NumberConfig(7,
                                       RulesConfigDescriptionLocalizable.SIZE,
                                       MGPValidators.range(1, 99)),
            },
        });

    public static get(): TriGoRules {
        if (TriGoRules.singleton.isAbsent()) {
            TriGoRules.singleton = MGPOptional.of(new TriGoRules());
        }
        return TriGoRules.singleton.get();
    }

    public override getInitialState(optionalConfig: MGPOptional<TriGoConfig>): GoState {
        const config: TriGoConfig = optionalConfig.get();
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

    public override getRulesConfigDescription(): MGPOptional<RulesConfigDescription<TriGoConfig>> {
        return MGPOptional.of(TriGoRules.RULES_CONFIG_DESCRIPTION);
    }

    public override getGoGroupDataFactory(): GroupDataFactory<GoPiece> {
        return new TriangularGoGroupDataFactory();
    }

}
