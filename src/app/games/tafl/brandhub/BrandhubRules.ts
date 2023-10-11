import { GameNode } from 'src/app/jscaip/GameNode';
import { brandhubConfig } from './brandhubConfig';
import { BrandhubState } from './BrandhubState';
import { TaflRules } from '../TaflRules';
import { BrandhubMove } from './BrandhubMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflPawn } from '../TaflPawn';
import { Table } from 'src/app/utils/ArrayUtils';

export class BrandhubNode extends GameNode<BrandhubMove, BrandhubState> {}

export class BrandhubRules extends TaflRules<BrandhubMove, BrandhubState> {

    private static singleton: MGPOptional<BrandhubRules> = MGPOptional.empty();

    public static get(): BrandhubRules {
        if (BrandhubRules.singleton.isAbsent()) {
            BrandhubRules.singleton = MGPOptional.of(new BrandhubRules());
        }
        return BrandhubRules.singleton.get();
    }

    private constructor() {
        super(brandhubConfig, BrandhubMove.from);
    }

    public getInitialState(): BrandhubState {
        const _: TaflPawn = TaflPawn.UNOCCUPIED;
        const x: TaflPawn = TaflPawn.INVADERS;
        const i: TaflPawn = TaflPawn.DEFENDERS;
        const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
        const board: Table<TaflPawn> = [
            [_, _, _, x, _, _, _],
            [_, _, _, x, _, _, _],
            [_, _, _, i, _, _, _],
            [x, x, i, A, i, x, x],
            [_, _, _, i, _, _, _],
            [_, _, _, x, _, _, _],
            [_, _, _, x, _, _, _],
        ];
        return new BrandhubState(board, 0);
    }
}
