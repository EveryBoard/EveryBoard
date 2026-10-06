/* eslint-disable max-lines-per-function */
import { PlayerNumberMap } from '../../../../jscaip/PlayerMap';
import { Table } from '../../../../jscaip/TableUtils';
import { MancalaConfig } from '../../common/MancalaConfig';
import { MancalaDistribution, MancalaMove } from '../../common/MancalaMove';
import { MancalaNode } from '../../common/MancalaRules';
import { MancalaState } from '../../common/MancalaState';
import { KalahMoveGenerator } from '../../kalah/KalahMoveGenerator';
import { AwaleMoveGenerator } from '../AwaleMoveGenerator';
import { AwaleRules } from '../AwaleRules';

describe('AwaleMoveGenerator', () => {

    let moveGenerator: KalahMoveGenerator;
    const defaultConfig: MancalaConfig = AwaleRules.get().getDefaultRulesConfig();

    beforeEach(() => {
        moveGenerator = new AwaleMoveGenerator();
    });

    it('should not generate illegal moves', () => {
        // Given a state with an illegal distribution due to the do-not-starve rule
        const board: Table<number> = [
            [1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0],
        ];
        const state: MancalaState = new MancalaState(board, 1, PlayerNumberMap.of(0, 0));
        const node: MancalaNode = new MancalaNode(state);

        // When listing the moves
        const moves: MancalaMove[] = moveGenerator.getListMoves(node, defaultConfig);

        // Then only the legal moves should be present
        expect(moves.length).toBe(1);
        expect(moves[0]).toEqual(MancalaMove.of(MancalaDistribution.of(5, 0)));
    });

    describe('Custom Config', () => {

        it('should provide move with several distributions when possible by config', () => {
            // Given a state with a config allowing multiple sowing
            const customConfig: MancalaConfig = {
                ...defaultConfig,
                passByPlayerStore: true,
                mustContinueDistributionAfterStore: true,
            };
            const state: MancalaState = AwaleRules.get().getInitialState(customConfig);

            const node: MancalaNode = new MancalaNode(state);

            // When listing the moves
            const moves: MancalaMove[] = moveGenerator.getListMoves(node, customConfig);

            // Then there should be the 5 moves not passing by the store
            const noStoreMoves: MancalaMove[] =
                moves.filter((move: MancalaMove) => move.distributions.length === 1);
            expect(noStoreMoves.length).toBe(5);
            // And there should be 5 with two sowings
            const storeMoves: MancalaMove[] =
                moves.filter((move: MancalaMove) => move.distributions.length === 2);
            expect(storeMoves.length).toBe(5);
            // Hence a total of 10 choices
            expect(moves.length).toBe(10);
        });

        it('should provide move from all rows', () => {
            // Given a state with a config with several rows
            const customConfig: MancalaConfig = {
                ...defaultConfig,
                numberOfRows: 2,
            };
            const state: MancalaState = AwaleRules.get().getInitialState(customConfig);

            const node: MancalaNode = new MancalaNode(state);

            // When listing the moves
            const moves: MancalaMove[] = moveGenerator.getListMoves(node, customConfig);

            // Then there should be the 12 moves
            expect(moves.length).toBe(12);
        });

    });

});
