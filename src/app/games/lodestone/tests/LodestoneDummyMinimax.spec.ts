/* eslint-disable max-lines-per-function */
import { LodestoneDummyMinimax } from '../LodestoneDummyMinimax';
import { LodestoneNode, LodestoneRules } from '../LodestoneRules';
import { LodestoneState } from '../LodestoneState';

fdescribe('LodestoneDummyMinimax', () => {
    let rules: LodestoneRules;
    let minimax: LodestoneDummyMinimax;

    beforeEach(() => {
        rules = LodestoneRules.get();
        minimax = new LodestoneDummyMinimax(rules, 'LodestoneDummyMinimax');
    });
    it('should propose 618 moves at first turn', () => {
        // Given the initial state
        const node: LodestoneNode = new LodestoneNode(LodestoneState.getInitialState());

        // Then there should be 618 possible moves
        // For each empty coord, each lodestone can be placed in 4 different position
        // For each position, we have to count the possible captures and how they can be placed
        // The total amounts to 618
        expect(minimax.getListMoves(node).length).toBe(618);
    });
});
