import { Injectable } from '@angular/core';

import { Placement } from '../models/placement.model';

@Injectable({
    providedIn: 'root',
})
export class SvgRendererService {
    renderFrames(x: DOMRect | null): string {
        if (!x) {
            return '';
        }

        const { width, height, left, right, top, bottom } = x;

        const getLineDef = (x1: number, y1: number, x2: number, y2: number) =>
            `<path class="frame-item" d="M ${(x1)} ${(y1)} L ${(x2)} ${(y2)}" stroke="currentColor" />`;

        const lines: string[] = [
            // top
            getLineDef(left - width * 0.0235, top - height * 0.0075, right + width * 0.0125, top + height * 0.015),
            getLineDef(left - width * 0.01, top + height * 0.01, right + width * 0.03, top - height * 0.019),
            //bottom
            getLineDef(left - width * 0.03, bottom - height * 0.01, right + width * 0.02, bottom + height * 0.0175),
            getLineDef(left - width * 0.0175, bottom + height * 0.01, right + width * 0.035, bottom - height * 0.01),
            // left
            getLineDef(left + width * 0.005, top - height * .02, left, bottom + height * .04),
            getLineDef(left - width * 0.005, top - height * 0.04, left + width * 0.01, bottom + height * 0.09),
            // right
            getLineDef(right + width * 0.003, top - height * .04, right - width * 0.005, bottom + height * .03),
            getLineDef(right - width * 0.007, top - height * 0.06, right + width * 0.005, bottom + height * 0.07),
        ];

        const paths = lines.join('\n');
        return paths;
    }

    renderArrow(popup: Placement, selected: DOMRect | null): string {
        if (!selected || !popup) {
            return '';
        }

        if (!selected || popup.side === 'inside') {
            return '';
        }

        const { left, right, top, bottom } = selected;

        const centerX = (right + left) / 2;
        const centerY = (top + bottom) / 2;
        let endX: number;
        let endY: number;
        switch (popup.side) {
            case 'top':
                endX = centerX;
                endY = top;
                break;
            case 'bottom':
                endX = centerX;
                endY = bottom;
                break;
            case 'left':
                endX = left;
                endY = centerY;
                break;
            case 'right':
                endX = right;
                endY = centerY;
                break;
            default:
                return '';
        }

        const cp = {
            top: popup.top,
            left: popup.left,
            right: popup.left + popup.width,
            bottom: popup.top + popup.height
        };

        const startX = (cp.right + cp.left) / 2;
        const startY = (cp.top + cp.bottom) / 2;

        const buildArrow = (x1: number, y1: number, x2: number, y2: number) => {
            const width = x2 - x1;
            const height = y2 - y1;

            //console.warn('@@', { width, height, x1, x2, y1, y2 })

            const widthRatio = (width * 1.2) / 100;
            const heightRatio = height / 100;

            const getNormalizedPoint = (x: number, y: number) => {
                x = x1 + x * widthRatio;
                y = y1 - (y - 97) * heightRatio;

                return { x, y };
            }
            const getNormalizedPointString = (x: number, y: number) => {
                const { x: nx, y: ny } = getNormalizedPoint(x, y);
                return `${nx} ${ny}`;
            };

            const getLine = (x0: number, y0: number, x1: number, y1: number) => {
                const dx = (x1 - x0);
                const dy = (y1 - y0);
                const l = Math.sqrt(dx ** 2 + dy ** 2); // length of vector before transformation

                const { x: cx, y: cy } = getNormalizedPoint(x0, y0); // center point after transformation
                const { x: tx, y: ty } = getNormalizedPoint(x1, y1); // end point after transformation

                const dx1 = (cx - tx);
                const dy1 = (cy - ty);
                const l1 = Math.sqrt(dx1 ** 2 + dy1 ** 2);

                const x11 = cx - dx1 * l / l1;
                const y11 = cy - dy1 * l / l1;

                return `M ${cx} ${cy} L ${x11} ${y11}`;
            }


            const res = `<path d="M${getNormalizedPointString(0, 99.5)} C ${getNormalizedPointString(33.6667, 99.5)} ${getNormalizedPointString(97.7, 80.6)} ${getNormalizedPointString(84.5, 1)}" stroke="currentColor"/>
            <path d="${getLine(84.5, 1.5, 78, 14.5)}" stroke="currentColor"/>
            <path d="${getLine(84.5, 1.5, 93, 11)}" stroke="currentColor"/>`;

            return res;
        };

        return buildArrow(startX, startY, centerX, bottom);
    }

}
