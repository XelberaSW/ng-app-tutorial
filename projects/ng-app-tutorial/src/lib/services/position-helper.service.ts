import { Injectable } from '@angular/core';

import { Dimentions } from '../models/dimentions.model';
import { Placement } from '../models/placement.model';

@Injectable({
    providedIn: 'root'
})
export class PositionHelperService {
    getIdealPopupPositionFor(popupDimensions: Dimentions, target: DOMRect | null, view: DOMRect): Placement {
        if (!target) {
            return {
                side: 'left',
                width: 0,
                height: 0,
                left: -1e6,
                top: -1e6
            };
        }

        const offset = 30;
        const bottomPlacement = this.getBestBottomPlacement(offset, popupDimensions, target, view);
        if (bottomPlacement) {
            return { ...bottomPlacement, side: 'bottom', width: popupDimensions.width, height: popupDimensions.height };
        }

        const topPlacement = this.getBestTopPlacement(offset, popupDimensions, target, view);
        if (topPlacement) {
            return { ...topPlacement, side: 'top', width: popupDimensions.width, height: popupDimensions.height };
        }

        const sidePlacement = this.getBestSidePlacement(offset, popupDimensions, target, view);
        if (sidePlacement) {
            return { ...sidePlacement, width: popupDimensions.width, height: popupDimensions.height };
        }

        return {
            top: target.bottom - offset - popupDimensions.height,
            left: target.right - offset - popupDimensions.width,
            width: popupDimensions.width,
            height: popupDimensions.height,
            side: 'inside'
        }
    }

    private getBestBottomPlacement(offset: number, container: Dimentions, target: DOMRect, view: DOMRect) {
        const containerWidth = container.width / 2;
        const containerHeight = container.height;

        const top = target.bottom + offset;
        if (containerHeight + top > view.bottom) {
            return null;
        }

        const left = target.left - offset;
        if (left - containerWidth >= view.left) {
            return { top, left };
        }

        const right = target.left + offset;
        if (right + containerWidth <= view.right) {
            return { top, left: right };
        }

        return { top, left: (target.left + container.width) / 2 };
    }

    private getBestTopPlacement(offset: number, container: Dimentions, target: DOMRect, view: DOMRect) {
        const containerWidth = container.width / 2;
        const containerHeight = container.height;

        const top = target.top - containerHeight;
        if (top < view.bottom) {
            return null;
        }

        const left = target.left - offset;
        if (left - containerWidth >= view.left) {
            return { top, left };
        }

        const right = target.left + offset;
        if (right + containerWidth <= view.right) {
            return { top, left: right };
        }

        return { top, left: (target.left + container.width) / 2 };
    }

    private getBestSidePlacement(offset: number, container: Dimentions, target: DOMRect, view: DOMRect): { top: number, left: number, side: 'left' | 'right' } | null {
        const containerWidth = container.width;

        const top = (target.top - container.height) / 2;

        const left = target.left - offset;
        if (left - containerWidth >= view.left) {
            return { top, left, side: 'left' };
        }

        const right = target.left + offset;
        if (right + containerWidth <= view.right) {
            return { top, left: right, side: 'right' };
        }

        return null;
    }
}
