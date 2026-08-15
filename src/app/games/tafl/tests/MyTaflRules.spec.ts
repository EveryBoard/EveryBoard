/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';

import { RulesConfigDescription } from '../../../components/wrapper-components/rules-configuration/RulesConfigDescription';
import { BooleanConfig } from 'src/app/components/wrapper-components/rules-configuration/BooleanConfig';
import { Table } from '../../../jscaip/TableUtils';
import { TaflConfig } from '../TaflConfig';
import { TaflPawn } from '../TaflPawn';
import { TaflNode, TaflRules } from '../TaflRules';
import { TaflState } from '../TaflState';

import { MyTaflMove } from './MyTaflMove.spec';

export class MyTaflNode extends TaflNode<MyTaflMove> {}

export class MyTaflRules extends TaflRules<MyTaflMove> {

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TaflConfig> =
        new RulesConfigDescription<TaflConfig>({
            name: (): string => `MyTafl`,
            config: {
                canReturnToCastle: new BooleanConfig(false, () => $localize`Central throne is left for good`),
                edgesAreKingsEnnemy: new BooleanConfig(true, () => $localize`Edges are king's ennemy`),
                centralThroneCanSurroundKing: new BooleanConfig(true, () => $localize`Central throne can surround king`),
                kingFarFromHomeCanBeSandwiched: new BooleanConfig(true, () => $localize`King far from home can be sandwiched`),
                invaderStarts: new BooleanConfig(true, () => $localize`Invader starts`),
            },
        });

    private static singleton: MGPOptional<MyTaflRules> = MGPOptional.empty();

    public static get(): MyTaflRules {
        if (MyTaflRules.singleton.isAbsent()) {
            MyTaflRules.singleton = MGPOptional.of(new MyTaflRules());
        }
        return MyTaflRules.singleton.get();
    }

    private constructor() {
        super(MyTaflMove.from);
    }

    public override getRulesConfigDescription(): RulesConfigDescription<TaflConfig> {
        return MyTaflRules.RULES_CONFIG_DESCRIPTION;
    }

    public override getInitialState(config: TaflConfig): TaflState {
        const _: TaflPawn = TaflPawn.UNOCCUPIED;
        let I: TaflPawn = TaflPawn.PLAYER_ZERO_PAWN;
        let D: TaflPawn = TaflPawn.PLAYER_ONE_PAWN;
        let K: TaflPawn = TaflPawn.PLAYER_ONE_KING;
        if (config.invaderStarts === false) {
            I = TaflPawn.PLAYER_ONE_PAWN;
            D = TaflPawn.PLAYER_ZERO_PAWN;
            K = TaflPawn.PLAYER_ZERO_KING;
        }
        const board: Table<TaflPawn> = [
            [_, I, _, _, D, _, _, I, _],
            [_, _, I, _, D, _, I, _, _],
            [_, _, _, _, D, _, _, _, _],
            [_, D, D, D, K, D, D, D, _],
            [_, _, _, _, D, _, _, _, _],
            [_, _, I, _, D, _, I, _, _],
            [_, I, _, _, D, _, _, I, _],
            [I, _, _, _, D, _, _, _, I],
            [_, _, _, _, D, _, _, _, _],
        ];

        return new TaflState(board, 0);
    }

}
