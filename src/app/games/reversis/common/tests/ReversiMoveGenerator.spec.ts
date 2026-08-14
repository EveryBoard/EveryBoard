/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from '@everyboard/games';
import { Table } from '@everyboard/games';

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

    const rules: AbstractReversiRules[] = [
        ReversiRules.get(),
        ToricReversiRules.get(),
    ];

    for (const rule of rules) {

        describe('for ' + rule.constructor.name, () => {

            beforeEach(() => {
                defaultConfig = rule.getDefaultRulesConfig();
                moveGenerator = new ReversiMoveGenerator(rule);
            });

            it('should have 4 choices at first turn', () => {
                const node: ReversiNode = rule.getInitialNode(defaultConfig);
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
