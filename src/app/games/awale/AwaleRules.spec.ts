import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AwaleRules} from './AwaleRules';
import { MNode } from 'src/app/jscaip/MNode';

describe('AwaleRules', () => {

    let previousGenerationsSizes: number[] = [0, 1, null, null, null, null];

    it('should be created', () => {
        expect(new AwaleRules()).toBeTruthy();
    });

    it('IA(depth=N) should create exactly as much descendant as it calculate their value', () => {
        const part = new AwaleRules();
        for (let i = 0; i<6; i++) {
            part.node.findBestMoveAndSetDepth(i);
            let iGenerationsOfNode = part.node.countDescendants();
            previousGenerationsSizes[i+1] = iGenerationsOfNode;
            expect(AwaleRules.GET_BOARD_VALUE_CALL_COUNT).toEqual(iGenerationsOfNode);
        };
    });

    it('IA(depth=N) should calculate list moves for only N-1 generations', () => {
        AwaleRules.GET_BOARD_VALUE_CALL_COUNT = 0;
        AwaleRules.GET_LIST_MOVES_CALL_COUNT = 0;
        const part = new AwaleRules();
        for (let i = 1; i<6; i++) {
            part.node.findBestMoveAndSetDepth(i);
            expect(AwaleRules.GET_LIST_MOVES_CALL_COUNT).toEqual(previousGenerationsSizes[i] + 1);
        };
    });
});