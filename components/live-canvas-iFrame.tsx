/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useRef, useState, useCallback } from "react";
import { createRoot } from 'react-dom/client';

interface LiveCanvasIframeProps {
  Component: React.ComponentType | null;
  editorActive: boolean | undefined;
  setSelectedComponent: React.Dispatch<React.SetStateAction<{
    domPath: string;
    tagName: string;
    attributes: Record<string, string>;
    innerHTML: string;
    textContent: string;
    classList: string[];
  } | undefined>>;
  manipulatedComponent: {
    domPath: string;
    tagName: string;
    attributes: Record<string, string>;
    innerHTML: string;
    textContent: string;
    classList: string[];
  } | undefined;
}

const LiveCanvasIframe = ({
  Component,
  editorActive,
  setSelectedComponent,
  manipulatedComponent,
}: LiveCanvasIframeProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const rootRef = useRef<any>(null);
  const messageListenerSetup = useRef(false);

  // Memoize the message handler
  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.data.type === 'COMPONENT_SELECTED') {
      setSelectedComponent(event.data.data);
    }
  }, [setSelectedComponent]);

  // Set up message listener ONCE
  useEffect(() => {
    if (messageListenerSetup.current) return;

    window.addEventListener('message', handleMessage);
    messageListenerSetup.current = true;

    return () => {
      window.removeEventListener('message', handleMessage);
      messageListenerSetup.current = false;
    };
  }, [handleMessage]);

  // Initialize iframe with static HTML only once
  useEffect(() => {
    if (!iframeRef.current) return;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { 
              margin: 0; 
              padding: 8px; 
              font-family: sans-serif; 
            }
          </style>
          <style id="editor-styles"></style>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `;

    iframeRef.current.srcdoc = html;

    const iframe = iframeRef.current;
    const handleLoad = () => {
      setIframeReady(true);
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe?.removeEventListener('load', handleLoad);
    };
  }, []); // Only run once

  useEffect(() => {
    if (!iframeReady || !iframeRef.current?.contentDocument) return;

    const styleElement = iframeRef.current.contentDocument.getElementById('editor-styles');
    if (!styleElement) return;

    styleElement.textContent = editorActive ? `
    #root,
      #root *,
      #root button,
      #root a,
      #root input,
      #root textarea,
      #root select {
      cursor: crosshair;
    }
      [data-editing="1"] {
        outline: 2px solid #ef4444 !important;
        cursor: crosshair;
        background: rgba(239, 68, 68, 0.05);
      }
    ` : '';
  }, [editorActive, iframeReady]);

  // Render React component inside iframe
  useEffect(() => {
    if (!iframeReady || !Component || !iframeRef.current?.contentDocument) return;

    const iframeDoc = iframeRef.current.contentDocument;
    const iframeWindow = iframeRef.current.contentWindow;
    const rootElement = iframeDoc.getElementById('root');

    if (!rootElement || !iframeWindow) return;

    try {
      // Create or reuse React root
      if (!rootRef.current) {
        rootRef.current = createRoot(rootElement);
      }

      // Render the component
      rootRef.current.render(<Component />);

      // Set up editor click handlers if editor is active
      if (editorActive) {
        setTimeout(() => {
          setupEditorHandlers(iframeDoc);
        }, 100);
      } else {
        // Clean up editor state when editor is inactive
        iframeDoc.querySelectorAll('[data-editing]').forEach(el => {
          el.removeAttribute('data-editing');
        });
      }

    } catch (error) {
      if (rootElement) {
        rootElement.innerHTML = `<div style="color: red; padding: 20px;">Error: ${error instanceof Error ? error.message : String(error)}</div>`;
      }
    }
  }, [Component, iframeReady, editorActive]);

  // ============================================
  // NEW: Apply manipulated component changes
  // ============================================
  useEffect(() => {
    if (!iframeReady || !manipulatedComponent || !iframeRef.current?.contentDocument) {
      return;
    }

    const iframeDoc = iframeRef.current.contentDocument;

    try {
      // Find the element using the domPath as a CSS selector
      const element = iframeDoc.querySelector(manipulatedComponent.domPath);

      if (!element) {
        return;
      }


      // 1. Update all attributes (except class - we'll handle that separately)
      Object.entries(manipulatedComponent.attributes).forEach(([key, value]) => {
        if (key === 'class') return; // Skip class, handle below

        if (element.getAttribute(key) !== value) {
          element.setAttribute(key, value);
        }
      });

      // 2. Remove attributes that are no longer present
      Array.from(element.attributes).forEach(attr => {
        if (attr.name === 'class') return; // Skip class
        if (!(attr.name in manipulatedComponent.attributes)) {
          element.removeAttribute(attr.name);
        }
      });

      // 3. Update classList specifically
      const newClassList = manipulatedComponent.classList.join(' ');
      if (element.className !== newClassList) {
        element.className = newClassList;
      }

      // 4. Update innerHTML if changed
      if (element.innerHTML !== manipulatedComponent.innerHTML) {
        element.innerHTML = manipulatedComponent.innerHTML;
      }


    } catch (error) {
    }
  }, [manipulatedComponent, iframeReady]);

  const setupEditorHandlers = (iframeDoc: Document) => {

    function getDOMPath(element: Element): string {
      const path: string[] = [];

      let currentElement: Element | null = element;
      while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
        let selector = currentElement.nodeName.toLowerCase();

        if (selector === 'html') {
          break;
        }

        if (currentElement.id) {
          selector += '#' + currentElement.id;
          path.unshift(selector);
          break;
        } else {
          let sibling: Element | null = currentElement;
          let nth = 1;

          while (sibling.previousElementSibling) {
            sibling = sibling.previousElementSibling;
            if (sibling.nodeName.toLowerCase() === selector) {
              nth++;
            }
          }

          const parent = currentElement.parentNode;
          const siblingsOfSameType = parent ?
            Array.from(parent.children).filter(child =>
              child.nodeName.toLowerCase() === selector
            ).length : 1;

          if (siblingsOfSameType > 1) {
            selector += ':nth-of-type(' + nth + ')';
          }
        }

        path.unshift(selector);
        currentElement = currentElement.parentNode as Element | null;
      }

      return path.join(' > ');
    }

    function handleMouseMove(event: MouseEvent) {
      const element = iframeDoc.elementFromPoint(event.clientX, event.clientY);

      if (!element) return;

      const rootElement = iframeDoc.getElementById('root');
      if (!rootElement || !rootElement.contains(element) || element.id === 'root') {
        return;
      }

      // Remove previous highlights
      iframeDoc.querySelectorAll('[data-editing]').forEach(el => {
        el.removeAttribute('data-editing');
      });

      // Highlight current element
      element.setAttribute('data-editing', '1');
    }

    function handleClick(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();

      const element = iframeDoc.elementFromPoint(event.clientX, event.clientY);

      if (!element) {
        return;
      }

      const rootElement = iframeDoc.getElementById('root');
      if (!rootElement || !rootElement.contains(element)) {
        return;
      }

      if (element.id === 'root') {
        return;
      }


      const domPath = getDOMPath(element);

      const componentData = {
        domPath: domPath,
        tagName: element.tagName.toLowerCase(),
        attributes: {} as Record<string, string>,
        innerHTML: element.innerHTML,
        textContent: element.textContent || '',
        classList: Array.from(element.classList)
      };

      Array.from(element.attributes).forEach(attr => {
        componentData.attributes[attr.name] = attr.value;
      });


      window.parent.postMessage({
        type: 'COMPONENT_SELECTED',
        data: componentData
      }, '*');
    }

    const rootElement = iframeDoc.getElementById('root');
    if (rootElement) {
      rootElement.addEventListener('mousemove', handleMouseMove);
      rootElement.addEventListener('click', handleClick);
    } else {
    }
  };

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full flex items-center justify-center"
      sandbox="allow-scripts allow-same-origin"
      title="Component Preview"
    />
  );
}

export default LiveCanvasIframe;
