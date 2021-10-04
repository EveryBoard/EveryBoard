import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JoueursDAO } from '../dao/JoueursDAO';
import { IJoueur, IJoueurId } from '../domain/iuser';
import { ActivesUsersService } from './ActivesUsersService';
import { FirebaseCollectionObserver } from '../dao/FirebaseCollectionObserver';

@Injectable({
    providedIn: 'root',
})
export class UserService {

    constructor(private activesUsersService: ActivesUsersService,
                private joueursDao: JoueursDAO) {
    }
    // On Server Component

    public getActivesUsersObs(): Observable<IJoueurId[]> {
        // TODO: unsubscriptions from other user services
        this.activesUsersService.startObserving();
        return this.activesUsersService.activesUsersObs;
    }
    public unSubFromActivesUsersObs(): void {
        this.activesUsersService.stopObserving();
    }
    // Delegate
    public observeUserByPseudo(pseudo: string, callback: FirebaseCollectionObserver<IJoueur>): () => void {
        // the callback will be called on the foundUser
        return this.joueursDao.observeUserByPseudo(pseudo, callback);
    }
}
