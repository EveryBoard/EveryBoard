import { Coord } from 'src/app/jscaip/Coord';
import { TablutState } from '../tablut/TablutState';
import { TaflPawn } from '../TaflPawn';
import { TablutNode, TablutRules } from '../tablut/TablutRules';
import { TaflMinimax, TaflNode } from '../TaflMinimax';
import { Table } from 'src/app/utils/ArrayUtils';
import { TablutMove } from '../tablut/TablutMove';
import { BrandhubState } from '../brandhub/BrandhubState';
import { BrandhubMove } from '../brandhub/BrandhubMove';
import { BrandhubNode, BrandhubRules } from '../brandhub/BrandhubRules';

describe('TaflMinimax:', () => {

    let rules: TablutRules;
    const _: TaflPawn = TaflPawn.UNOCCUPIED;
    const O: TaflPawn = TaflPawn.INVADERS;
    const X: TaflPawn = TaflPawn.DEFENDERS;
    const A: TaflPawn = TaflPawn.PLAYER_ONE_KING;

    beforeEach(() => {
        rules = TablutRules.get();
        rules.node = rules.node.getInitialNode();
    });
    it('Should try to make the king escape when it can', () => {
        const board: Table<TaflPawn> = [
            [_, _, O, A, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, X, _],
            [_, _, _, _, _, _, _, _, _],
        ];
        const state: TablutState = new TablutState(board, 1);
        rules.node = new TablutNode(state);
        const winnerMove: TablutMove = TablutMove.of(new Coord(3, 0), new Coord(8, 0));

        const minimax: TaflMinimax = new TaflMinimax(rules, 'TablutMinimax');
        const bestMove: TablutMove = rules.node.findBestMove(1, minimax);
        expect(bestMove).toEqual(winnerMove);
    });
    it('Should not propose to King to go back on the throne when its forbidden', () => {
        // Given a board where king could go back on his throne but the rules forbid it
        const brandhubRules: BrandhubRules = BrandhubRules.get();
        const minimax: TaflMinimax = new TaflMinimax(brandhubRules, 'Brandhub Minimax');
        const board: Table<TaflPawn> = [
            [_, _, _, O, _, _, _],
            [_, _, _, _, O, _, _],
            [_, _, O, A, _, _, O],
            [O, _, _, _, O, X, _],
            [_, _, O, O, _, _, _],
            [_, _, _, _, _, _, _],
            [_, _, _, _, _, _, _],
        ];
        const state: BrandhubState = new BrandhubState(board, 1);
        const node: TaflNode = new BrandhubNode(state) as TaflNode;

        // When asking the list of legal move
        const moves: BrandhubMove[] = minimax.getListMoves(node);

        // Then going back on throne should not be part of it
        const kingBackOnThrone: BrandhubMove = BrandhubMove.of(new Coord(3, 2), new Coord(3, 3));
        expect(moves).not.toContain(kingBackOnThrone);
    });
});
