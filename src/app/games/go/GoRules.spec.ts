import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GoRules} from './GoRules';
import {MoveX} from '../../jscaip/MoveX';
import { GoPartSlice } from './GoPartSlice';
import { GoMove } from './GoMove';
import { MNode } from 'src/app/jscaip/MNode';
import { Coord } from 'src/app/jscaip/Coord';

describe('GoRules', () => {

    it('should be created', () => {
        expect(new GoRules()).toBeTruthy();
    });

    it('simple capture should be legal', () => {
        const part = new GoRules();
        expect(part.choose(new GoMove(0, 1, []))).toEqual(true);
        expect(part.choose(new GoMove(0, 0, []))).toEqual(true);
        expect(part.choose(new GoMove(1, 1, []))).toEqual(true);
    });

    it('superposition shoud be illegal', () => {
        const part = new GoRules();
        expect(part.choose(new GoMove(0, 1, []))).toEqual(true);
        expect(part.choose(new GoMove(0, 1, []))).toEqual(false);
    });

    it('ko shoud be illegal', () => {
        const part = new GoRules();
        expect(part.choose(new GoMove(2, 0, []))).toEqual(true);
        expect(part.choose(new GoMove(1, 0, []))).toEqual(true);
        expect(part.choose(new GoMove(1, 1, []))).toEqual(true);
        expect(part.choose(new GoMove(0, 1, []))).toEqual(true);
        expect(part.choose(new GoMove(0, 0, []))).toEqual(true); // Capture creating ko
        expect(part.choose(new GoMove(1, 0, []))).toEqual(false); // the illegal ko move
    });
});