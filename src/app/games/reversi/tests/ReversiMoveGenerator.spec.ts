/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { ReversiMove } from '../ReversiMove';
import { ReversiState } from '../ReversiState';
import { ReversiConfig, ReversiNode, ReversiRules } from '../ReversiRules';
import { Table } from 'src/app/utils/ArrayUtils';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';
import { MGPOptional } from 'src/app/utils/MGPOptional';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('ReversiMoveGenerator', () => {

    let rules: ReversiRules;
    let moveGenerator: ReversiMoveGenerator;
    let defaultConfig: MGPOptional<ReversiConfig>;

    beforeEach(() => {
        rules = ReversiRules.get();
        defaultConfig = rules.getDefaultRulesConfig();
        moveGenerator = new ReversiMoveGenerator();
    });
    it('should have 4 choices at first turn', () => {
        const node: ReversiNode = rules.getInitialNode(defaultConfig);
        const moves: ReversiMove[] = moveGenerator.getListMoves(node);
        expect(moves.length).toBe(4);
    });
    it('should propose passing move when no other moves are possible', () => {
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, O, _, _, _],
        ];
        const state: ReversiState = new ReversiState(board, 1);
        const node: ReversiNode = new ReversiNode(state, undefined, undefined, defaultConfig);
        const moves: ReversiMove[] = moveGenerator.getListMoves(node);
        expect(moves.length).toBe(1);
        expect(moves[0]).toBe(ReversiMove.PASS);
    });
});
