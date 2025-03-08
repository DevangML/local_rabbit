declare module "*.svg" {
      import React from "react";
      const SVG: React.FC<React.SVGProps<SVGSVGElement>>;
      export default SVG;
}

declare module "*.png" {
      const value: string;
      export default value;
}

declare module "*.jpg" {
      const value: string;
      export default value;
}

declare module "*.jpeg" {
      const value: string;
      export default value;
}

declare module "*.gif" {
      const value: string;
      export default value;
}

declare module "*.ico" {
      const value: string;
      export default value;
}

declare module "*.webp" {
      const value: string;
      export default value;
}

declare module "*.json" {
      const value: any;
      export default value;
}

interface Window {
      __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
} 