import {DIRECTION} from './DIRECTION';

export class Coord {

 public readonly x: number;

 public readonly y: number;

 constructor(x: number, y: number) {
  this.x = x;
  this.y = y;
 }

 public getNext(dir: Coord): Coord { // TODO enum DIRECTION & remplacer la Coord en arg par une DIRECTION
  // return the next coord in the direction 'dir'
  return new Coord(this.x + dir.x, this.y + dir.y);
 }

 public getPrevious(dir: Coord): Coord { // TODO caster dir en DIRECTION
  return new Coord(this.x - dir.x, this.y - dir.y);
 }

 public isInRange(sizeX: number, sizeY: number): boolean {
  if (this.x < 0) { return false; }
  if (this.y < 0) { return false; }
  if (this.x >= sizeX) { return false; }
  if (this.y >= sizeY) { return false; }
  return true;
 }

 equals(arg0: any): any {
 throw new Error('Method not implemented.');
 }

 // @Override
 // public int hashCode() {
 //  final int prime = 31;
 //  int result = 1;
 //  result = prime * result + x;
 //  result = prime * result + y;
 //  return result;
 // }

 // @Override
 // public boolean equals(Object obj) {
 //  if (this === obj)
 //   return true;
 //  if (obj === null)
 //   return false;
 //  if (getClass() !== obj.getClass())
 //   return false;
 //  Coord other = (Coord) obj;
 //  if (x !== other.x)
 //   return false;
 //  if (y !== other.y)
 //   return false;
 //  return true;
 // }

 // @Override
 // public String toString() {
 //  return '(' + x + ', ' + y + ')';
 // }

}
