import { GameNode } from 'src/app/jscaip/GameNode';
import { hnefataflConfig } from './hnefataflConfig';
import { HnefataflState } from './HnefataflState';
import { TaflRules } from '../TaflRules';
import { HnefataflMove } from './HnefataflMove';
import { MGPOptional } from 'src/app/utils/MGPOptional';
import { TaflPawn } from '../TaflPawn';
import { Table } from 'src/app/utils/ArrayUtils';

export class HnefataflNode extends GameNode<HnefataflMove, HnefataflState> {}

export class HnefataflRules extends TaflRules<HnefataflMove, HnefataflState> {

    private static singleton: MGPOptional<HnefataflRules> = MGPOptional.empty();

    public static get(): HnefataflRules {
        if (HnefataflRules.singleton.isAbsent()) {
            HnefataflRules.singleton = MGPOptional.of(new HnefataflRules());
        }
        return HnefataflRules.singleton.get();
    }

    private constructor() {
        super(hnefataflConfig, HnefataflMove.from);
    }

    public getInitialState(): HnefataflState {
        const _: TaflPawn = TaflPawn.UNOCCUPIED;
        const O: TaflPawn = TaflPawn.INVADERS;
        const X: TaflPawn = TaflPawn.DEFENDERS;
        const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;
        const board: Table<TaflPawn> = [
            [_, _, _, O, O, O, O, O, _, _, _],
            [_, _, _, _, _, O, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _],
            [O, _, _, _, _, X, _, _, _, _, O],
            [O, _, _, _, X, X, X, _, _, _, O],
            [O, O, _, X, X, A, X, X, _, O, O],
            [O, _, _, _, X, X, X, _, _, _, O],
            [O, _, _, _, _, X, _, _, _, _, O],
            [_, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, O, _, _, _, _, _],
            [_, _, _, O, O, O, O, O, _, _, _],
        ];
        return new HnefataflState(board, 0);
    }
}
