import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ChatService} from '../../../services/ChatService';
import {IMessage} from '../../../domain/imessage';
import {UserService} from '../../../services/UserService';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

	@Input() chatId: string;
	@Input() turn: number;
	userName: string;

	chat: IMessage[];
	userMessage: string;

	constructor(private chatService: ChatService, private userService: UserService) {}

	ngOnInit() {
		console.log('chat component initialisation');
		this.userService.userNameObs.subscribe(username => {
			this.userName = username;
			this.loadChatContent();
		});
	}

	loadChatContent() {
		if (this.chatId == null || this.chatId === '') {
			console.log('No chat to join mentionned');
		} else if (this.userName == null || this.userName === '') {
			console.log('Only logged users can access the chat');
			const msg: IMessage = {sender: 'fake', content: 'bonjour', postedTime: Date.now(), lastTurnThen: null};
			this.chat = [msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg, msg];
		} else {
			console.log(this.userName + ' logged');
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
		console.log('chat component destroyed');
		this.chatService.stopObserving();
	}

}
