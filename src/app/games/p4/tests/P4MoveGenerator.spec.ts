/* eslint-disable max-lines-per-function */
import { P4State } from '../P4State';
import { P4Config, P4Node, P4Rules } from '../P4Rules';
import { Table } from 'src/app/jscaip/TableUtils';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { P4MoveGenerator } from '../P4MoveGenerator';
import { MGPOptional } from '@everyboard/lib';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('P4MoveGenerator', () => {

    let moveGenerator: P4MoveGenerator;
    const defaultConfig: MGPOptional<P4Config> = P4Rules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new P4MoveGenerator();
    });

    it('should know when a column is full or not', () => {
        const board: Table<PlayerOrNone> = [
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, _, _, _, _, _, _],
            [X, _, _, _, _, _, _],
            [O, O, X, O, X, O, X],
        ];
        const state: P4State = new P4State(board, 12);
        const node: P4Node = new P4Node(state);
        expect(moveGenerator.getListMoves(node, defaultConfig).length).toBe(6);
    });

});
