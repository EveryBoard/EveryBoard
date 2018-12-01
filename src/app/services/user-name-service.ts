import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class UserNameService {

	private messageSource = new BehaviorSubject('pas connecté');
	currentMessage = this.messageSource.asObservable();

	constructor() {
	}

	changeMessage(message: string) {
		this.messageSource.next(message);
	}
}
