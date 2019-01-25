import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ChatService} from '../../../services/ChatService';
import {IMessage} from '../../../domain/imessage';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

	@Input() chatId: string;
	@Input() userName: string;
	@Input() turn: number;

	chat: IMessage[];
	userMessage: string;

	constructor(private chatService: ChatService) {}

	ngOnInit() {
		if (this.chatId == null || this.chatId === '') {
			console.log('Chat Id is null, keep your attempt, it suck');
		} else if (this.userName == null || this.userName === '') {
			console.log('ChatCompo : get yourself a userName you twat');
			const msg: IMessage = {sender: 'fake', content: 'bonjour', postedTime: Date.now(), lastTurnThen: null};
			this.chat = [msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg];
		} else {
			this.chatService.startObserving(this.chatId, chat => this.chat = chat.chat.messages);
		}
	}

	sendMessage() {
		if (this.userName === '') {
			console.log('je t\'envois un toast car t\'es pas connecté donc tu te tait!');
		}
		this.chatService.sendMessage(this.userName, this.turn, this.userMessage);
		this.userMessage = '';
	}

	ngOnDestroy() {
		this.chatService.stopObserving();
	}

}
