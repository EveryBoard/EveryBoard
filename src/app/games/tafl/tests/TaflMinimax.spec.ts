import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { TablutState } from '../tablut/TablutState';
import { TaflPawn } from '../TaflPawn';
import { TablutRules } from '../tablut/TablutRules';
import { TaflMinimax } from '../TaflMinimax';
import { Table } from 'src/app/utils/ArrayUtils';
import { TablutMove } from '../tablut/TablutMove';

describe('TaflMinimax:', () => {

    let rules: TablutRules;
    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const x: TaflPawn = TaflPawn.INVADERS;
    const i: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = TablutRules.get();
        rules.node = rules.node.getInitialNode();
    });
    it('Should try to make the king escape when it can', () => {
        const board: Table<TaflPawn> = [
            [_, _, x, A, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, i, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 1);
        rules.node = new MGPNode(null, null, state);
        const winnerMove: TablutMove = new TablutMove(new Coord(3, 0), new Coord(8, 0));

        const minimax: TaflMinimax = new TaflMinimax(rules, 'TablutMinimax');
        const bestMove: TablutMove = rules.node.findBestMove(1, minimax);
        expect(bestMove).toEqual(winnerMove);
    });
});
