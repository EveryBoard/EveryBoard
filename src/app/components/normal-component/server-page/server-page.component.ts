import { Component, OnInit } from '@angular/core';
import { IUser } from '../../../domain/iuser';
import { ICurrentPart } from '../../../domain/icurrentpart';

@Component({
  selector: 'app-server-page',
  templateUrl: './server-page.component.html',
  styleUrls: ['./server-page.component.css']
})
export class ServerPageComponent implements OnInit {

  readonly partList: Array<ICurrentPart>;
  readonly userList: Array<IUser>;
  readonly gameList: Array<String> = ['P4', 'Awale', 'Quarto'];

  constructor() {
    const p1: ICurrentPart = {
      'typeGame' : 'P4',
      'playerZero' : 'thePlayerZero',
      'playerOne' : 'thePlayerOne',
      'turn' : 0
    };
    const p2: ICurrentPart = {
      'typeGame' : 'Awale',
      'playerZero' : 'the2',
      'playerOne' : 'the3',
      'turn' : 15
    };
    this.partList = [p1, p2];
    const u1: IUser = {
      'id': 0,
      'pseudo' : 'roger',
      'email' : 'who care',
      'dateInscription' : new Date(),
      'status' : 0,
    };
    const u2: IUser = {
      'id': 1,
      'pseudo' : 'beniuiui',
      'email' : 'lol@mdr.com',
      'dateInscription' : new Date(),
      'status' : 0,
    };
    this.userList = [u1, u2];
  }

  ngOnInit() {

  }

}
