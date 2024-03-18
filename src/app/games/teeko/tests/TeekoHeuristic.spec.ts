/* eslint-disable max-lines-per-function */
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { TeekoConfig, TeekoNode, TeekoRules } from '../TeekoRules';
import { TeekoState } from '../TeekoState';
import { Table } from 'src/app/jscaip/TableUtils';
import { TeekoHeuristic } from '../TeekoHeuristic';
import { MGPOptional } from '@everyboard/lib';

const _: PlayerOrNone = PlayerOrNone.NONE;
const O: PlayerOrNone = PlayerOrNone.ZERO;

describe('TeekoHeuristic', () => {

    let heuristic: TeekoHeuristic;
    const defaultConfig: MGPOptional<TeekoConfig> = TeekoRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        heuristic = new TeekoHeuristic();
    });

    it('should count the number of possible squares and lines', () => {
        // Given any board with only piece of Player.ZERO
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _],
            [_, _, _, _, _],
            [_, _, O, _, _],
            [_, _, _, _, _],
            [_, _, _, _, _],
        ];
        const state: TeekoState = new TeekoState(board, 6);
        const node: TeekoNode = new TeekoNode(state);

        // When calculating the board value
        const boardValue: readonly number[] = heuristic.getBoardValue(node, defaultConfig).metrics;

        // Then it should be the negative number of possible victories for Player.ZERO
        expect(boardValue).toEqual([-12]);
    });

});
