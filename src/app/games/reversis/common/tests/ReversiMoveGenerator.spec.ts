/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from '../../../../jscaip/Player';
import { Table } from '../../../../jscaip/TableUtils';
import { ReversiRules } from '../../reversi/ReversiRules';
import { ToricReversiRules } from '../../toric-reversi/ToricReversiRules';
import { AbstractReversiRules, ReversiConfig, ReversiNode } from '../AbstractReversiRules';
import { ReversiMove } from '../ReversiMove';
import { ReversiMoveGenerator } from '../ReversiMoveGenerator';
import { ReversiState } from '../ReversiState';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;
const X: PlayerOrNone = PlayerOrNone.ONE;

describe('ReversiMoveGenerator', () => {

    let moveGenerator: ReversiMoveGenerator;
    let defaultConfig: ReversiConfig;
    let rules: AbstractReversiRules;

    const rulesSets: { rules: AbstractReversiRules, name: string }[] = [
        { rules: ReversiRules.get(), name: 'ReversiRules' },
        { rules: ToricReversiRules.get(), name: 'ToricReversiRules' },
    ];

    for (const rulesSet of rulesSets) {

        describe('for ' + rulesSet.name, () => {

            beforeEach(() => {
                rules = rulesSet.rules;
                defaultConfig = rules.getDefaultRulesConfig();
                moveGenerator = new ReversiMoveGenerator(rules);
            });

            it('should have 4 choices at first turn', () => {
                const node: ReversiNode = rules.getInitialNode(defaultConfig);
                const moves: ReversiMove[] = moveGenerator.getListMoves(node, defaultConfig);
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
                const node: ReversiNode = new ReversiNode(state);
                const moves: ReversiMove[] = moveGenerator.getListMoves(node, defaultConfig);
                expect(moves.length).toBe(1);
                expect(moves[0]).toBe(ReversiMove.PASS);
            });
        });

    }

});
