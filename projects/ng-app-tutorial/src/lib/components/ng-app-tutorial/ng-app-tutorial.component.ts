import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { BehaviorSubject, Observable, combineLatest, delay, distinctUntilChanged, firstValueFrom, map, of, shareReplay, startWith, switchMap } from 'rxjs';

import { HelpItem } from '../../models/help-item.model';
import { ElementWatcherService } from '../../services/element-watcher.service';
import { HelpTargetProviderService } from '../../services/help-target-provider.service';
import { PositionHelperService } from '../../services/position-helper.service';
import { SvgRendererService } from '../../services/svg-renderer.service';

@Component({
    templateUrl: './ng-app-tutorial.component.html',
    styleUrls: ['./ng-app-tutorial.component.scss']
})
export class NgAppTutorialComponent {
    private readonly _selectedNode$ = new BehaviorSubject<string | undefined>(undefined);
    private readonly _popup$ = new BehaviorSubject<ElementRef<HTMLElement> | undefined>(undefined);


    constructor(
        private readonly helpTargetsProvider: HelpTargetProviderService,
        private readonly elementWatcher: ElementWatcherService,
        private readonly svgRenderer: SvgRendererService,
        private readonly positionHelper: PositionHelperService,
        private readonly domSanitizer: DomSanitizer
    ) {
    }

    readonly hide = new EventEmitter<void>();

    readonly allItems$ = this.helpTargetsProvider.watchAvailableHelpTargets();

    readonly selectedNode$: Observable<HelpItem | null> = this._selectedNode$.pipe(
        map(x => x ?? null),
        distinctUntilChanged(),
        switchMap(id => this.allItems$.pipe(
            map(x => {
                return (id ? x[id] ?? null : null) ?? Object.values(x)[0] ?? null;
            })
        )),
        delay(0),
        shareReplay(1)
    );

    readonly content$ = this.selectedNode$.pipe(
        switchMap(x => x?.content ?? of(null))
    );

    readonly isClickable$ = this.selectedNode$.pipe(
        map(x => x?.canClick)
    );

    readonly root$ = this.elementWatcher.watchRoot().pipe(
        shareReplay(1)
    );

    readonly viewbox$ = this.root$.pipe(map(x => `${x.left} ${x.top} ${x.width} ${x.height}`));
    readonly rootWidth$ = this.root$.pipe(map(x => x.width));
    readonly rootHeight$ = this.root$.pipe(map(x => x.height));

    readonly selectedNodeBounds$ = this.selectedNode$.pipe(
        switchMap(x => {
            const el = x?.el;
            if (!el) {
                return of(null);
            }

            return this.elementWatcher.watch(el);
        }),
        shareReplay(1)
    );

    readonly selectedNodeTop$ = this.selectedNodeBounds$.pipe(
        map(x => `${x?.top ?? 0}px`),
        shareReplay(1)
    );

    readonly selectedNodeBottom$ = this.selectedNodeBounds$.pipe(
        map(x => `${x?.bottom ?? 0}px`),
        shareReplay(1)
    );
    readonly selectedNodeLeft$ = this.selectedNodeBounds$.pipe(
        map(x => `${x?.left ?? 0}px`),
        shareReplay(1)
    );
    readonly selectedNodeRight$ = this.selectedNodeBounds$.pipe(
        map(x => `${x?.right ?? 0}px`),
        shareReplay(1)
    );

    readonly selectedNodeWidth$ = this.selectedNodeBounds$.pipe(
        map(x => `${(x?.right ?? 0) - (x?.left ?? 0)}px`),
        shareReplay(1)
    );

    readonly selectedNodeHeight$ = this.selectedNodeBounds$.pipe(
        map(x => `${(x?.bottom ?? 0) - (x?.top ?? 0)}px`),
        shareReplay(1)
    );


    readonly frame$ = this.selectedNodeBounds$.pipe(
        map(x => this.svgRenderer.renderFrames(x)),
        map(x => this.domSanitizer.bypassSecurityTrustHtml(x))
    );

    readonly popupDimensions$ = this._popup$.pipe(
        map(ref => ref?.nativeElement),
        switchMap(el => {
            if (!el) {
                return of(null);
            }

            return this.elementWatcher.watchResize(el).pipe(
                startWith(el.getBoundingClientRect())
            );
        }),
        map(x => ({ width: x?.width ?? 0, height: x?.height ?? 0 })),
        distinctUntilChanged((a, b) => Math.abs(a.width - b.width) < Number.EPSILON && Math.abs(a.height - b.height) < Number.EPSILON),
        shareReplay()
    );

    readonly popupPosition$ = combineLatest([this.root$, this.popupDimensions$, this.selectedNodeBounds$]).pipe(
        map(([viewport, popupDimensions, selected]) => this.positionHelper.getIdealPopupPositionFor(popupDimensions, selected, viewport)),
        shareReplay(1)
    );

    readonly popupTop$ = this.popupPosition$.pipe(
        map(x => `${x.top}px`)
    );

    readonly popupLeft$ = this.popupPosition$.pipe(
        map(x => `${x.left}px`)
    )

    readonly arrow$ = combineLatest([this.selectedNodeBounds$, this.popupPosition$]).pipe(
        map(([selected, popup]) => this.svgRenderer.renderArrow(popup, selected)),
        map(x => this.domSanitizer.bypassSecurityTrustHtml(x))
    );

    @ViewChild('popup')
    public set popup(value: ElementRef<HTMLElement> | undefined) {
        this._popup$.next(value);
    }
    public get popup(): ElementRef<HTMLElement> | undefined {
        return this._popup$.value;
    }

    async clickPlaceholder($event: MouseEvent) {
        $event.preventDefault();
        $event.stopPropagation();

        const node = await firstValueFrom(this.selectedNode$);
        if (!node?.canClick) {
            return;
        }

        node.el.click();
    }

    setSelectedNode(node: string | undefined) {
        this._selectedNode$.next(node);
    }

    selectNext(): void;
    /** @private @internal */
    @HostListener('window:keydown.arrowRight', ['$event'])
    async selectNext(event?: KeyboardEvent | undefined): Promise<void> {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const next = this.helpTargetsProvider.getNext(this._selectedNode$.value);
        if (next) {
            this.setSelectedNode(next);
        }
        else {
            this.close();
        }
    }

    selectPrev(): void;
    /** @private @internal */
    @HostListener('window:keydown.arrowLeft', ['$event'])
    selectPrev(event?: KeyboardEvent | undefined): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        const next = this.helpTargetsProvider.getPrev(this._selectedNode$.value);
        if (next) {
            this.setSelectedNode(next);
        }
        else {
            this.close();
        }
    }

    @HostListener('window:keydown.escape', ['$event'])
    close(event?: KeyboardEvent | undefined): void {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.hide.emit();
    }

}
