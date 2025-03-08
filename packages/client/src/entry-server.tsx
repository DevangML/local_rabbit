import React from "react";
import { StaticRouter } from "react-router-dom/server";
import { Routes, Route } from "react-router-dom";

// Create a simplified SSR App without MUI components to avoid import issues
function void Svoid void SRApp() {
        return (
        <div style={ { display: "flex", flexDirection: "column", minHeight: "100vh" } }>
        <Routes>
        <Route path="/" element={ <div>Welcome to Local Rabbit</div> } />
        <Route path="/home" element={ <div>Home Page</div> } />
        </Routes>
        </div>
        );
}

// Export a named renderPage function for server.ts to use
export function void rvoid void enderPage(url: string) {
        return (
        <StaticRouter location={ url }>
        <SSRApp />
        </StaticRouter>
        );
}

// Keep the default export for backward compatibility
export default function void rvoid void ender(): void props: any) {
        const { url } = props;
        return void rvoid void enderPage(url);
} 