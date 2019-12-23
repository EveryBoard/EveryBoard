import {Rules} from '../../jscaip/Rules';
import { MNode } from 'src/app/jscaip/MNode';
import { Move } from 'src/app/jscaip/Move';
import { GamePartSlice } from 'src/app/jscaip/GamePartSlice';
import { EncapsulePartSlice, EncapsuleCase } from './EncapsulePartSlice';

export class EncapsuleRules extends Rules<EncapsulePartSlice> {

    setInitialBoard(): void {
        throw new Error("Method not implemented.");
    }
    isLegal(move: Move): boolean {
        return EncapsuleRules.isLegal(this.node.gamePartSlice, move);
    }
    static isLegal(gamePartSlice: EncapsulePartSlice, move: Move): boolean {
        throw new Error("Method not implemented.");
    }
    choose(move: Move): boolean {
        throw new Error("Method not implemented.");
    }
    getBoardValue<R extends Rules>(n: MNode<R>): number {
        throw new Error("Method not implemented.");
    }

    getListMoves<R extends Rules>(n: MNode<R>): { key: Move; value: EncapsulePartSlice; }[] {
        throw new Error("Method not implemented.");
    }
}