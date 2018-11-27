import { Component } from '@angular/core';
import { UserNameService } from './services/user-name-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Multi Game';

  constructor(private userNameService: UserNameService) {}
}
