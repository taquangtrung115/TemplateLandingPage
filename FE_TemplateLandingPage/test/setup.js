import '@testing-library/jest-dom';

// Mock ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock HTMLCanvasElement.getContext for MotionParticles & jsdom
if (typeof HTMLCanvasElement !== 'undefined') {
  const dummyContext = new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === 'measureText') return () => ({ width: 0 });
        if (prop === 'getImageData') return () => ({ data: new Array(100) });
        return () => {};
      },
    }
  );
  HTMLCanvasElement.prototype.getContext = () => dummyContext;
}

// Ensure localStorage is clean before each test
beforeEach(() => {
  localStorage.clear();
});

