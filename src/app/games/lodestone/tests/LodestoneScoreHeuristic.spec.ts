/* eslint-disable max-lines-per-function */
import { MGPOptional } from '@everyboard/lib';
import { LodestoneScoreHeuristic } from '../LodestoneScoreHeuristic';
import { LodestonePiece, LodestonePieceNone, LodestonePiecePlayer } from '../LodestonePiece';
import { LodestonePositions, LodestonePressurePlate, LodestonePressurePlates, LodestoneState } from '../LodestoneState';
import { MGPMap } from '@everyboard/lib';
import { HeuristicUtils } from 'src/app/jscaip/AI/tests/HeuristicUtils.spec';
import { Player } from 'src/app/jscaip/Player';
import { NoConfig } from 'src/app/jscaip/RulesConfigUtil';
import { LodestoneRules } from '../LodestoneRules';

describe('LodestoneScoreHeuristic', () => {

    let heuristic: LodestoneScoreHeuristic;
    const defaultConfig: NoConfig = LodestoneRules.get().getDefaultRulesConfig();

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
