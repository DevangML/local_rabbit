declare module '@client/entry-server' {
  export function renderPage(url: string): Promise<{
    appHtml: string;
    headTags: string;
    htmlAttrs: string;
    bodyAttrs: string;
  }>;
} 