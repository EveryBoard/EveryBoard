/* eslint-disable max-lines-per-function */
import { Player } from '@everyboard/games';
import { HeuristicUtils } from '@everyboard/games';
import { EmptyRulesConfig } from '@everyboard/games';
import { MGPMap, MGPOptional } from '@everyboard/lib';

import { LodestonePiece, LodestonePieceNone, LodestonePiecePlayer } from '../LodestonePiece';
import { LodestoneRules } from '../LodestoneRules';
import { LodestoneScoreHeuristic } from '../LodestoneScoreHeuristic';
import { LodestonePositions, LodestonePressurePlates, LodestoneState } from '../LodestoneState';

describe('LodestoneScoreHeuristic', () => {

    let heuristic: LodestoneScoreHeuristic;
    const defaultConfig: EmptyRulesConfig = LodestoneRules.get().getDefaultRulesConfig();

    const _: LodestonePiece = LodestonePieceNone.EMPTY;
    const O: LodestonePiece = LodestonePiecePlayer.ZERO;
    const X: LodestonePiece = LodestonePiecePlayer.ONE;

    const allPressurePlates: LodestonePressurePlates = LodestoneState.INITIAL_PRESSURE_PLATES;

    const noLodestones: LodestonePositions = new MGPMap();

    beforeEach(() => {
        heuristic = new LodestoneScoreHeuristic();
    });

    it('should prefer a higher score', () => {
        // Given a state with more player pieces than another
        const strongState: LodestoneState = new LodestoneState([
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, O, O, _, _, _],
            [_, _, _, O, O, _, _, _],
            [_, _, _, O, O, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ], 0, noLodestones, allPressurePlates);
        const weakState: LodestoneState = new LodestoneState([
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, X, _, _, _],
            [_, _, _, _, O, _, _, _],
            [_, _, _, _, O, _, _, _],
            [_, _, _, _, O, _, _, _],
            [_, _, _, _, _, _, _, _],
            [_, _, _, _, _, _, _, _],
        ], 0, noLodestones, allPressurePlates);
        // When computing their value
        // Then it should prefer having more pieces (i.e., a higher score)
        HeuristicUtils.expectSecondStateToBeBetterThanFirstFor(heuristic,
                                                               weakState, MGPOptional.empty(),
                                                               strongState, MGPOptional.empty(),
                                                               Player.ZERO,
                                                               defaultConfig);

    });

});
