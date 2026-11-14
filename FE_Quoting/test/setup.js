import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';

// Astryx loads mobile sheets lazily; give their real import/render cycle time on CI.
configure({ asyncUtilTimeout: 5000 });

global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

if (typeof window !== 'undefined') {
  if (typeof HTMLDialogElement !== 'undefined') {
    HTMLDialogElement.prototype.showModal = HTMLDialogElement.prototype.showModal || function () {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = HTMLDialogElement.prototype.close || function () {
      this.open = false;
    };
    HTMLDialogElement.prototype.showPopover = HTMLDialogElement.prototype.showPopover || function () {
      this.open = true;
    };
    HTMLDialogElement.prototype.hidePopover = HTMLDialogElement.prototype.hidePopover || function () {
      this.open = false;
    };
  }

  window.matchMedia =
    window.matchMedia ||
    function () {
      return {
        matches: false,
        media: '',
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      };
    };
}

beforeEach(() => {
  localStorage.clear();
});

