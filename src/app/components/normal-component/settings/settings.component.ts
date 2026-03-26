import { Component, inject } from '@angular/core';

import { ThemeService } from '../../../services/ThemeService';
import { UserSettingsService } from '../../../services/UserSettingsService';
import { NgFor } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

type SettingOption = { value: string, name: string }

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    imports: [NgFor, ReactiveFormsModule]
})
export class SettingsComponent {
    private readonly userSettingsService = inject(UserSettingsService);


    public readonly availableLanguages: SettingOption[] = [
        { value: 'fr', name: 'Français' },
        { value: 'en', name: 'English' },
    ];
    public readonly availableThemes: SettingOption[] = [
        { value: 'light', name: $localize`Light` },
        { value: 'dark', name: $localize`Dark` },
    ];
    public currentTheme: string;
    public currentLanguage: string;

    public constructor() {
        const themeService = inject(ThemeService);

        this.currentTheme = themeService.getTheme();
        this.currentLanguage = this.userSettingsService.getLanguage();
    }
    public changeLanguage(event: Event): void {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        this.userSettingsService.changeLanguage(target.value);
        this.reload();
    }
    public changeTheme(event: Event): void {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        this.userSettingsService.changeTheme(target.value);
        this.reload();
    }
    private reload(): void {
        // Reload app to apply changes
        window.open(window.location.href, '_self');
    }
}
