import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class GameInfoService {

	private gameName = new BehaviorSubject<string>(':');
	private partId = new BehaviorSubject<string>('');

	currentGameName = this.gameName.asObservable();
	currentPartId = this.partId.asObservable();

	constructor() {}

	changeGame(partId: string, gameName: string) {
		this.changePartId(partId);
		this.changeGameName(gameName);
	}

	changeGameName(gameName: string) {
		this.gameName.next(gameName);
	}

	changePartId(partId: string) {
		this.partId.next(partId);
	}
}
