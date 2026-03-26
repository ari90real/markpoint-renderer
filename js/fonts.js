/**
 * fonts.js — Font mapping for the Labelpoint II renderer.
 */
var LPFonts = (function () {
    'use strict';
    var FONT_MAP = {
        94021: { family: 'Arial, sans-serif', weight: 'normal', style: 'normal' },
        94022: { family: 'Arial, sans-serif', weight: 'normal', style: 'italic' },
        94023: { family: 'Arial, sans-serif', weight: 'bold',   style: 'normal' },
        94024: { family: 'Arial, sans-serif', weight: 'bold',   style: 'italic' },
        94029: { family: '"Arial Narrow", Arial, sans-serif', weight: 'normal', style: 'normal' },
        94030: { family: '"Arial Narrow", Arial, sans-serif', weight: 'bold',   style: 'normal' },
        94039: { family: '"Arial Narrow", Arial, sans-serif', weight: 'normal', style: 'italic' },
        94040: { family: '"Arial Narrow", Arial, sans-serif', weight: 'bold',   style: 'italic' },
        92500: { family: '"Times New Roman", serif', weight: 'normal', style: 'normal' },
        92501: { family: '"Times New Roman", serif', weight: 'normal', style: 'italic' },
        92504: { family: '"Times New Roman", serif', weight: 'bold',   style: 'normal' },
        92505: { family: '"Times New Roman", serif', weight: 'bold',   style: 'italic' },
        93779: { family: '"Courier New", monospace', weight: 'bold',   style: 'normal' },
        93780: { family: '"Courier New", monospace', weight: 'bold',   style: 'italic' },
        90249: { family: 'cursive', weight: 'normal', style: 'normal' },
        24459: { family: 'Arial, sans-serif', weight: 'normal', style: 'normal' },
        24460: { family: 'Arial, sans-serif', weight: 'normal', style: 'italic' },
        24461: { family: 'Arial, sans-serif', weight: 'bold',   style: 'normal' },
        24462: { family: 'Arial, sans-serif', weight: 'bold',   style: 'italic' },
        24455: { family: '"Times New Roman", serif', weight: 'normal', style: 'normal' },
        24456: { family: '"Times New Roman", serif', weight: 'normal', style: 'italic' },
        24457: { family: '"Times New Roman", serif', weight: 'bold',   style: 'normal' },
        24458: { family: '"Times New Roman", serif', weight: 'bold',   style: 'italic' },
        1: { family: 'monospace', weight: 'bold',   style: 'normal' },
        2: { family: 'monospace', weight: 'normal', style: 'normal' },
        3: { family: 'monospace', weight: 'bold',   style: 'normal' },
        4: { family: 'monospace', weight: 'normal', style: 'normal' },
        5: { family: 'monospace', weight: 'bold',   style: 'normal' },
        6: { family: 'monospace', weight: 'normal', style: 'normal' },
        7: { family: 'monospace', weight: 'normal', style: 'normal' }
    };
    var BITMAP_BASE_PX = { 1:9, 2:18, 3:15, 4:9, 5:19, 6:42, 7:19 };
    function _lookupFont(fontId) {
        var rec = FONT_MAP[parseInt(fontId, 10)];
        return rec || { family: 'sans-serif', weight: 'normal', style: 'normal' };
    }
    function getPixelSize(heightParam, subtype, dpi, fontId) {
        if (subtype === 'bitmap') {
            var basePx = BITMAP_BASE_PX[parseInt(fontId, 10)] || 9;
            var factor = Math.max(1, Math.min(16, parseInt(heightParam, 10) || 1));
            return basePx * factor;
        }
        return (parseFloat(heightParam) || 12) * (dpi / 72);
    }
    function getFontFamily(fontId) { return _lookupFont(fontId).family; }
    function getFontWeight(fontId) { return _lookupFont(fontId).weight; }
    function getFontStyle(fontId)  { return _lookupFont(fontId).style; }
    function getCSS(fontId, heightParam, widthParam, subtype, dpi) {
        var rec = _lookupFont(fontId);
        var sizePx = getPixelSize(heightParam, subtype, dpi || 96, fontId);
        var parts = [];
        if (rec.style !== 'normal') parts.push(rec.style);
        if (rec.weight !== 'normal') parts.push(rec.weight);
        parts.push(Math.round(sizePx) + 'px');
        parts.push(rec.family);
        return parts.join(' ');
    }
    return { getCSS: getCSS, getFontFamily: getFontFamily, getFontWeight: getFontWeight, getFontStyle: getFontStyle, getPixelSize: getPixelSize };
}());
