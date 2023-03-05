import { SafeHtml } from '@angular/platform-browser';

import { Observable } from 'rxjs';

export type HelpItem = {
    id: string,
    el: HTMLElement;
    order: number;
    canClick: boolean;
    content: Observable<SafeHtml>;
    nextId: string | null;
};

export type HelpItems = Record<string, HelpItem>;