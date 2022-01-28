import { Injectable } from '@angular/core';
import { LocaleUtils } from '../utils/LocaleUtils';
import { MGPOptional } from '../utils/MGPOptional';

@Injectable({
    providedIn: 'root',
})
export class UserSettingsService {
    constructor() {
    }

    public changeTheme(theme: string): void {
        localStorage.setItem('theme', theme);
    }
    public getTheme(): MGPOptional<string> {
        return MGPOptional.ofNullable(localStorage.getItem('theme'));
    }
    public changeLanguage(language: string): void {
        localStorage.setItem('locale', language.toLowerCase());
    }
    public getLanguage(): string {
        return LocaleUtils.getLocale();
    }
}
