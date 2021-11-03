import { Coord } from 'src/app/jscaip/Coord';
import { MGPNode } from 'src/app/jscaip/MGPNode';
import { TablutMove } from '../TablutMove';
import { TablutState } from '../TablutState';
import { TablutCase } from '../TablutCase';
import { TablutNode, TablutRules } from '../TablutRules';
import { TablutMinimax } from '../TablutMinimax';
import { Table } from 'src/app/utils/ArrayUtils';

describe('TablutMinimax:', () => {

    let rules: TablutRules;
    const _: TablutCase = TablutCase.UNOCCUPIED;
    const x: TablutCase = TablutCase.INVADERS;
    const i: TablutCase = TablutCase.DEFENDERS;
    const A: TablutCase = TablutCase.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = new TablutRules(TablutState);
    });
    it('Should try to make the king escape when it can', () => {
        const board: Table<TablutCase> = [
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
        rules.node = new TablutNode(null, null, state);
        const winnerMove: TablutMove = new TablutMove(new Coord(3, 0), new Coord(8, 0));

        const minimax: TablutMinimax = new TablutMinimax(rules, 'TablutMinimax');
        const bestMove: TablutMove = rules.node.findBestMove(1, minimax);
        expect(bestMove).toEqual(winnerMove);
    });
});
