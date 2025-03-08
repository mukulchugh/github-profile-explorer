/// <reference types="vite/client" />

// Define module augmentation for dynamic imports
declare module 'virtual:*' {
  const module: any;
  export default module;
}

// Add support for dynamic imports in react-router-dom
declare module '*?lazy' {
  const Component: React.ComponentType<any>;
  export default Component;
}

// Add import.meta types
interface ImportMeta {
  readonly env: {
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly PROD: boolean;
    readonly DEV: boolean;
    readonly SSR: boolean;
    // Add any other environment variables your app uses
    readonly [key: string]: any;
  };
  readonly hot: {
    readonly accept: Function;
    readonly dispose: Function;
    readonly data: any;
  };
}
