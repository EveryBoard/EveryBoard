/* eslint-disable max-lines-per-function */
import { MancalaState } from '../../common/MancalaState';
import { AwaleMoveGenerator } from '../AwaleMoveGenerator';
import { PlayerNumberMap } from 'src/app/jscaip/PlayerMap';
import { AwaleRules } from '../AwaleRules';
import { MancalaConfig } from '../../common/MancalaConfig';
import { MancalaDistribution, MancalaMove } from '../../common/MancalaMove';
import { MancalaNode } from '../../common/MancalaRules';
import { MGPOptional } from '@everyboard/lib';
import { KalahMoveGenerator } from '../../kalah/KalahMoveGenerator';
import { Table } from 'src/app/jscaip/TableUtils';

describe('AwaleMoveGenerator', () => {

    let moveGenerator: KalahMoveGenerator;
    const defaultConfig: MGPOptional<MancalaConfig> = AwaleRules.get().getDefaultRulesConfig();

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
        expect(moves[0]).toEqual(MancalaMove.of(MancalaDistribution.of(5)));
    });

    describe('Custom Config', () => {

        it('should provide move with several distributions when possible by config', () => {
            // Given a state with a config allowing multiple sowing
            const customConfig: MGPOptional<MancalaConfig> = MGPOptional.of({
                ...defaultConfig.get(),
                passByPlayerStore: true,
                mustContinueDistributionAfterStore: true,
            });
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

    });

});
