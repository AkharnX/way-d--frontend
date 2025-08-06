// filepath: /home/akharn/way-d/frontend/src/types/global.d.ts
// Cette déclaration permet d'étendre l'objet Window avec nos services
interface Window {
  healthService?: any;
  profileService?: any;
  logActivity?: any;
}

// Type for health check responses
interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  database?: string;
  version?: string;
  error?: string;
}

// Déclaration d'un module pour gérer les fichiers CSS dans TypeScript
declare module '*.css' {
  const css: { [key: string]: string };
  export default css;
}

// Déclaration d'un module pour gérer les fichiers SVG dans TypeScript
declare module '*.svg' {
  import React = require('react');
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

// Déclaration pour fichiers image
declare module '*.png'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.gif'
declare module '*.webp'
