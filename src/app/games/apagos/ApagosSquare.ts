import { Player } from 'src/app/jscaip/Player';
import { ComparableObject } from 'src/app/utils/Comparable';
import { MGPFallible } from 'src/app/utils/MGPFallible';
import { MGPMap } from 'src/app/utils/MGPMap';
import { assert } from 'src/app/utils/utils';

export class ApagosSquare implements ComparableObject {

    public static from(nbZero: number, nbOne: number, nbTotal: number): MGPFallible<ApagosSquare> {
        if (nbZero + nbOne > nbTotal) {
            return MGPFallible.failure('invalid starting case');
        }
        const containing: MGPMap<Player, number> = new MGPMap();
        containing.set(Player.ZERO, nbZero);
        containing.set(Player.ONE, nbOne);
        containing.set(Player.NONE, nbTotal);
        containing.makeImmutable();
        const validSquare: ApagosSquare = new ApagosSquare(containing);
        return MGPFallible.success(validSquare);
    }
    private constructor(public readonly containing: MGPMap<Player, number>)
    { }
    public isFull(): boolean {
        const nbZero: number = this.containing.get(Player.ZERO).get();
        const nbOne: number = this.containing.get(Player.ONE).get();
        const nbTotal: number = this.containing.get(Player.NONE).get();
        return (nbZero + nbOne) >= nbTotal;
    }
    public addPiece(piece: Player): ApagosSquare {
        assert(piece !== Player.NONE, 'should not call ApagosSquare.addPiece with Player.NONE');
        let nbZero: number = this.containing.get(Player.ZERO).get();
        let nbOne: number = this.containing.get(Player.ONE).get();
        const nbTotal: number = this.containing.get(Player.NONE).get();
        if (piece === Player.ZERO) {
            nbZero++;
        } else {
            nbOne++;
        }
        return ApagosSquare.from(nbZero, nbOne, nbTotal).get();
    }
    public substractPiece(piece: Player): ApagosSquare {
        assert(piece !== Player.NONE, 'should not call ApagosSquare.addPiece with Player.NONE');
        let nbZero: number = this.containing.get(Player.ZERO).get();
        let nbOne: number = this.containing.get(Player.ONE).get();
        const nbTotal: number = this.containing.get(Player.NONE).get();
        if (piece === Player.ZERO) {
            nbZero--;
        } else {
            nbOne--;
        }
        return ApagosSquare.from(nbZero, nbOne, nbTotal).get();
    }
    public getDominatingPlayer(): Player {
        const nbZero: number = this.containing.get(Player.ZERO).get();
        const nbOne: number = this.containing.get(Player.ONE).get();
        if (nbZero > nbOne) return Player.ZERO;
        else if (nbOne > nbZero) return Player.ONE;
        return Player.NONE;
    }
    public equals(other: ApagosSquare): boolean {
        return this.containing.equals(other.containing);
    }
    public toString(): string {
        throw new Error('TODOTODO: toString not implemented.');
    }
}
