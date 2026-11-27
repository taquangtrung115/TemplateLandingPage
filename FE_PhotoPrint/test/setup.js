import '@testing-library/jest-dom/vitest';

Object.defineProperty(window, 'scrollTo', { value() {}, configurable: true });
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
}
