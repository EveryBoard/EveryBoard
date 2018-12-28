import {Move} from './Move';
import {Coord} from './Coord';

export class MoveCoord extends Move {

	readonly coord: Coord;

	/* public MoveCoord(short x, short y) {
     this.coord = new Coord(x, y);
    } */ // TODO vérifier si il est nécessaire

	constructor(x: number, y: number) {
		super();
		this.coord = new Coord(x, y);
	}

	/*
    @Override
    public int hashCode() {
     final int prime = 31;
     int result = 1;
     result = prime * result + ((coord === null) ? 0: coord.hashCode());
     return result;
    }
    */

	equals(obj: any): boolean {
		if (this === obj) {
			return true;
		}
		if (obj === null) {
			return false;
		}
		if (!(obj instanceof MoveCoord)) {
			return false;
		}
		if (this.coord === null) {
			if (obj.coord !== null) {
				return false;
			}
		} else {
			if (!this.coord.equals(obj.coord)) {
				return false;
			}
		}
		return true;
	}

	toString() {
		return 'MoveCoord [coord = ' + this.coord.toString() + ']';
	}

	getCopy(): Move {
		return new MoveCoord(this.coord.x, this.coord.y);
	}
}

