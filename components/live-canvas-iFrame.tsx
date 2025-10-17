"use client"
import { useEffect, useRef } from "react";
import * as ReactDOMServer from 'react-dom/server';

interface LiveCanvasIframeProps {
    Component: React.ComponentType | null;
}

const LiveCanvasIframe = ({ Component }: LiveCanvasIframeProps) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!iframeRef.current || !Component) return;

        // Serialize the component to static HTML
        const componentHTML = ReactDOMServer.renderToString(<Component />);

        const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; font-family: sans-serif; }
          </style>
        </head>
        <body>
          ${componentHTML}
        </body>
      </html>
    `;

        iframeRef.current.srcdoc = html;
    }, [Component]);

    return <iframe ref={iframeRef} className="w-full h-full border rounded" />;
};

export default LiveCanvasIframe;