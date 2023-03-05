import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import { Observable, ReplaySubject, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ElementWatcherService {
    private readonly _rootObs$ = new ReplaySubject<DOMRect>(1);

    private _cachedRootObs$: Observable<DOMRect> | undefined;

    constructor(@Inject(DOCUMENT) private readonly document: Document) { }

    watchResize(el: HTMLElement): Observable<DOMRect> {
        if (!el) {
            return of(new DOMRect());
        }
        return new Observable<DOMRect>(subscr => {
            const ro = new ResizeObserver((resizes) => {
                const resize = resizes[0];

                const size = resize.target.getBoundingClientRect();
                console.warn({ size });

                subscr.next(size);
            });

            ro.observe(el);

            return () => {
                ro.disconnect();
            }
        });
    }

    watch(el: HTMLElement): Observable<DOMRect> {
        if (!el) {
            return of(new DOMRect());
        }
        return new Observable<DOMRect>(subscr => {
            const ro = new ResizeObserver((resizes) => {
                const resize = resizes[0];

                const size = resize.target.getBoundingClientRect();
                console.warn({ size });

                subscr.next(size);
            });

            const io = new IntersectionObserver((entries, o) => {
                const entry = entries[0];
                if (!entry.isIntersecting) {
                    entry.target.scrollIntoView({
                        block: "center",
                        inline: "center",
                    });
                }
                else {
                    console.warn({ entry });
                    subscr.next(entry.boundingClientRect);

                    ro.observe(el);

                    o.disconnect();
                }
            });

            io.observe(el);

            return () => {
                ro.disconnect();
                io.disconnect();
            }
        });
    }

    watchRoot(): Observable<DOMRect> {
        return this._cachedRootObs$ ??= (() => {

            const root = this.document.body;

            let current = root.getBoundingClientRect();

            const handlers: ((r: DOMRect) => void)[] = [];

            const ro = new ResizeObserver((entries) => {
                current = entries[0].contentRect;

                handlers.forEach(handler => handler(current));
            });

            return new Observable<DOMRect>(subscr => {
                subscr.next(current);

                const handler = subscr.next.bind(subscr);
                handlers.push(handler);
                if (handlers.length === 1) {
                    ro.observe(root);
                }

                return () => {
                    const idx = handlers.indexOf(handler);
                    if (idx !== -1) {
                        handlers.splice(idx, 1);
                        if (handler.length === 0) {
                            ro.unobserve(root);
                            ro.disconnect();
                        }
                    }
                };
            });
        })();
    }
}
