/* eslint-disable max-lines-per-function */
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflNode, TaflRules } from '../TaflRules';
import { MyTaflMove } from './MyTaflMove.spec';
import { TaflConfig } from '../TaflConfig';
import { RulesConfigDescription } from 'src/app/components/wrapper-components/rules-configuration/RulesConfigDescription';
import { Table } from 'src/app/utils/ArrayUtils';
import { TaflPawn } from '../TaflPawn';
import { TaflState } from '../TaflState';

export class MyTaflNode extends TaflNode<MyTaflMove> {}

export class MyTaflRules extends TaflRules<MyTaflMove> {

    public static readonly RULES_CONFIG_DESCRIPTION: RulesConfigDescription<TaflConfig> =
        new RulesConfigDescription(
            {
                name: (): string => $localize`Brandhub`,
                config: {
                    castleIsLeftForGood: true,
                    invaderStarts: true,
                    kingFarFromHomeCanBeSandwiched: true,
                    centralThroneCanSurroundKing: true,
                    edgesAreKingsEnnemy: true,
                },
            }, {
                castleIsLeftForGood: (): string => $localize`Central throne is left for good`,
                edgesAreKingsEnnemy: (): string => $localize`Edges are king's ennemy`,
                centralThroneCanSurroundKing: (): string => $localize`Central throne can surround king`,
                kingFarFromHomeCanBeSandwiched: (): string => $localize`King far from home can be sandwiched`,
                invaderStarts: (): string => $localize`Invader starts`,
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

    public getInitialState(config: TaflConfig): TaflState {
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
