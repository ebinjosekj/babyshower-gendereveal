// Android phones get a lighter build of the heaviest ambient effects (same look, fewer layers to repaint while scrolling).
export const ANDROID = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
