import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpXhrBackend } from '@angular/common/http';
import { Inject, Injectable, Optional, isDevMode } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Observable, catchError, map, of, shareReplay, tap } from 'rxjs';

import { Converter } from 'showdown';

import { DESCR_CAN_CLICK, DESCR_MD_PROP, DESCR_MD_SRC_PROP, DESCR_NEXT, DESCR_ORDER_PROP, DESCR_TEXT_PROP, ID_PROP } from '../models/constants';
import { HelpItem, HelpItems } from '../models/help-item.model';

interface ItemsHandler {
    (items: Record<string, HelpItem>): unknown;
}

const skipNoContentWarning = new Set<string>();
const mdFileCache: Record<string, Observable<string>> = {};

@Injectable({
    providedIn: 'root'
})
export class HelpTargetProviderService {
    private readonly _converter = new Converter();
    private readonly _subjCache: { subj: Observable<Record<string, HelpItem>> | undefined } = { subj: undefined };

    constructor(
        @Inject(DOCUMENT) private readonly document: Document,
        @Optional() private readonly httpClient: HttpClient,
        private readonly domSanitazer: DomSanitizer
    ) {
        if (!this.httpClient) {
            this.httpClient = new HttpClient(new HttpXhrBackend({
                build: () => new XMLHttpRequest()
            }));
        }
    }

    watchAvailableHelpTargets() {
        return this._subjCache.subj ??= (() => {
            let items = Array.prototype.slice.call(this.document.querySelectorAll(`[${ID_PROP}]:not([${ID_PROP}=""]`)).map(x => this.prepareItem(x)).reduce((prev, curr) => {
                if (curr) {
                    prev[curr.id] = curr;
                }
                return prev;
            }, {} as HelpItems);

            // get initial value
            const handlers: ItemsHandler[] = [];
            const m = this.createMutationsObserver(items, async (newItems) => {
                items = newItems;
                await Promise.all(handlers.map(x => x(newItems)));
            });

            return new Observable<HelpItems>(subscr => {
                // send current state
                subscr.next(items);

                // update handler
                const handler: ItemsHandler = subscr.next.bind(subscr);
                handlers.push(handler);
                if (handlers.length === 1) {
                    // Start listening for mutations if not already. 
                    // We need this for tracking dynamic ui elements that could be added to the view
                    m.observe(this.document.body, {
                        attributes: true,
                        attributeFilter: [ID_PROP], // listen just for this attribute change
                        childList: true,
                        subtree: true
                    });
                }

                // teardown logic
                return () => {
                    const idx = handlers.indexOf(handler);
                    if (idx !== -1) {
                        handlers.splice(idx, 1);
                        if (!handlers.length) {
                            // if no active listeners - stop mutation observer
                            m.disconnect();
                        }
                    }
                }
            });
        })();
    }

    getPrev(value: string | undefined): string | undefined {
        return undefined;
    }
    getNext(value: string | undefined): string | undefined {
        return undefined;
    }

    private createMutationsObserver(currentItems: HelpItems, newItemsCallback: (elements: HelpItems) => void) {
        return new MutationObserver((mutations) => {
            let mutatedItems: HelpItem[] | undefined;
            let hasChanges = false;
            const getMutatedItems = () => mutatedItems ??= Object.values(currentItems);
            for (const mutation of mutations) {
                if (mutation.type === 'attributes') {
                    // if this is a atribbute change - listening it
                    const el = mutation.target as HTMLElement;
                    const myItems = getMutatedItems();
                    if (!myItems.find(x => x.el === el)) {
                        const itemsToAdd = this.prepareItem(el);
                        if (itemsToAdd) {
                            myItems.push(itemsToAdd);
                            hasChanges = true;
                        }
                    }
                }
                else if (mutation.type === 'childList' && mutation.removedNodes.length) {
                    // handling node removal
                    mutation.removedNodes.forEach(node => {
                        if (node instanceof HTMLElement) {
                            // it this node has any child with property we are interested in - proceed id
                            node.querySelectorAll(`[${ID_PROP}]`).forEach(item => {
                                const el = item as HTMLElement;
                                const myItems = getMutatedItems();
                                const idx = myItems.findIndex(x => x.el === el);
                                if (idx !== -1) {
                                    myItems.splice(idx, 1);
                                    hasChanges = true
                                }
                            });
                        }
                    });
                }
            }

            if (hasChanges) {
                currentItems = getMutatedItems().reduce((prev, curr) => {
                    if (curr) {
                        prev[curr.id] = curr;
                    }
                    return prev;
                }, {} as Record<string, HelpItem>)
                newItemsCallback(currentItems);
            }
        });
    }

    private prepareItem(el: Element): HelpItem | undefined {
        if (!(el instanceof HTMLElement)) {
            return;
        }

        const id = el.getAttribute(ID_PROP);
        if (!id) {
            return;
        }

        const text = el.getAttribute(DESCR_TEXT_PROP);
        const md = el.getAttribute(DESCR_MD_PROP);
        const mdSrc = el.getAttribute(DESCR_MD_SRC_PROP);

        let data: Observable<string>;
        if (text) {
            data = of(text);
        }
        else if (mdSrc) {
            data = mdFileCache[id] ??= (() => this.httpClient.get<string>(mdSrc, { responseType: 'string' as any }).pipe(
                tap(x => console.warn('LOADED', x)),
                map(x => this._converter.makeHtml(x)),
                tap(x => console.warn('CONV', x)),
                catchError(err => this.getHtmlErrorMessage(err)),
                tap(x => console.warn('RES', x)),
            ))();
        }
        else if (md) {
            data = of(md).pipe(
                map(x => this._converter.makeHtml(x)),
                tap(x => console.warn('CONV', x)),
                catchError(err => this.getHtmlErrorMessage(err)),
                tap(x => console.warn('RES', x)),
            );
        }
        else {
            if (!skipNoContentWarning.has(id)) {
                skipNoContentWarning.add(id);

                console.warn(`[ngAppTutorial] Element ${id} has no content to show defined. Skipping.`);
            }
            return;
        }

        const order = Number.parseInt(el.getAttribute(DESCR_ORDER_PROP) ?? '');

        return {
            id,
            el,
            canClick: el.hasAttribute(DESCR_CAN_CLICK),
            nextId: el.getAttribute(DESCR_NEXT),
            order: Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER,
            content: data.pipe(
                map(x => this.domSanitazer.bypassSecurityTrustHtml(x)),
                shareReplay(1)
            )
        };
    }

    private getHtmlErrorMessage(err: any): Observable<string> {
        const strings: string[] = [];

        const normalizeString = (s: string | null | undefined) => s?.replace('\\n', '\n').split('\n') ?? [];
        if (err instanceof Error) {
            strings.push(...(normalizeString('Name: ' + err.name)));
            strings.push(...(normalizeString('Message: ' + err.message)));

            if (isDevMode()) {
                if (err.stack) {
                    strings.push('Stack trace:');
                    strings.push(...normalizeString(err.stack));
                }
            }
        }
        else if (err instanceof HttpErrorResponse) {
            strings.push(...normalizeString(err.statusText));

            if (isDevMode()) {
                if (err.message) {
                    strings.push(...(normalizeString('Message: ' + err.message)));
                }
            }
        }
        else if (typeof err !== "string") {
            console.error(err);
            if (isDevMode()) {
                err = JSON.stringify(err);
            }
            else {
                err = `${err}`;
            }
            strings.push(...normalizeString(err));
        }
        else {
            strings.push(...normalizeString(err));
        }

        return of(`<div class="error"><h2>Unexpected error</h2><p>${strings.join('<br />')}</p></div>`);
    }
}
