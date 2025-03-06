interface TemplateProps {
  children: string;
}

export function Template({ children }: TemplateProps) {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Local Rabbit</title>
        <link rel="stylesheet" href="/client/style.css" />
      </head>
      <body>
        <div id="root">${children}</div>
        <script type="module" src="/client/main.js"></script>
      </body>
    </html>`;
} 