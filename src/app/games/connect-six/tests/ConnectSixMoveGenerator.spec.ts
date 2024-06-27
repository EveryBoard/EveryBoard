/* eslint-disable max-lines-per-function */
import { Coord } from 'src/app/jscaip/Coord';
import { ConnectSixFirstMove, ConnectSixMove } from '../ConnectSixMove';
import { ConnectSixNode, ConnectSixRules } from '../ConnectSixRules';
import { ConnectSixState } from '../ConnectSixState';
import { PlayerOrNone } from 'src/app/jscaip/Player';
import { Table } from 'src/app/jscaip/TableUtils';
import { ConnectSixMoveGenerator } from '../ConnectSixMoveGenerator';
import { GobanConfig } from 'src/app/jscaip/GobanConfig';
import { MGPOptional } from '@everyboard/lib';

describe('ConnectSixMoveGenerator', () => {

    let moveGenerator: ConnectSixMoveGenerator;

    const _: PlayerOrNone = PlayerOrNone.NONE;
    const O: PlayerOrNone = PlayerOrNone.ZERO;

    const defaultConfig: MGPOptional<GobanConfig> = ConnectSixRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new ConnectSixMoveGenerator();
    });

    it('should propose only one move at first turn', () => {
        // Given the initial node
        const width: number = defaultConfig.get().width;
        const height: number = defaultConfig.get().height;
        const state: ConnectSixState = ConnectSixRules.get().getInitialState(defaultConfig);
        const node: ConnectSixNode = new ConnectSixNode(state);

        // When listing the moves
        const moves: ConnectSixMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then it should only include the center of the board
        const cx: number = Math.floor(width/2);
        const cy: number = Math.floor(height/2);
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(ConnectSixFirstMove.of(new Coord(cx, cy)));
    });

    it('should count all possible moves including only neighboring-coord', () => {
        // Given a board with 60 possibles combinations of two coords
        // With the firsts being neighbors of a piece on board
        // and the seconds being neighbors of a piece on board or of the firsts coords
        const board: Table<PlayerOrNone> = [
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
            [_, _, O, O, O, O, O, _, _, _, _, _, _, _, _, _, _, _, _],
        ];
        const state: ConnectSixState = new ConnectSixState(board, 3);
        const node: ConnectSixNode = new ConnectSixNode(state);

        // When listing the moves
        const moves: ConnectSixMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then the answer should be 65
        expect(moves.length).toBe(65);
    });

});
