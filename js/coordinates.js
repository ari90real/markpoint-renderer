/**
 * coordinates.js — Coordinate transformation for Labelpoint II renderer.
 * All LP II values in 1/10 mm. X grows right-to-left, Y grows upward.
 * Scale: pixels = (tenthsMm / 10) * (dpi / 25.4)
 */
var LPCoords = (function () {
    'use strict';
    var _labelWidthMm = 0, _labelHeightMm = 0, _dpi = 96;
    function init(labelWidthMm, labelHeightMm, dpi) {
        _labelWidthMm = labelWidthMm; _labelHeightMm = labelHeightMm; _dpi = dpi;
    }
    function unitsToPixels(tenthsMm) { return (tenthsMm / 10) * (_dpi / 25.4); }
    function mmToPixels(mm) { return mm * (_dpi / 25.4); }
    function getCanvasSize() { return { width: mmToPixels(_labelWidthMm), height: mmToPixels(_labelHeightMm) }; }
    function toCanvas(baseline, position, upVector) {
        var s = getCanvasSize(), bPx = unitsToPixels(baseline), pPx = unitsToPixels(position), x, y;
        switch (upVector) {
            case 'N': case 'S': x = s.width - pPx; y = s.height - bPx; break;
            case 'W': case 'E': x = s.width - bPx; y = s.height - pPx; break;
            default: x = s.width - pPx; y = s.height - bPx;
        }
        return { x: x, y: y };
    }
    function getRotation(upVector) {
        switch (upVector) {
            case 'N': return 0; case 'E': return -Math.PI/2;
            case 'S': return Math.PI; case 'W': return Math.PI/2; default: return 0;
        }
    }
    return { init: init, toCanvas: toCanvas, getRotation: getRotation, unitsToPixels: unitsToPixels, mmToPixels: mmToPixels, getCanvasSize: getCanvasSize };
}());
