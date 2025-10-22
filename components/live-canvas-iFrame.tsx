"use client"

import { useEffect, useRef } from "react";
import * as ReactDOMServer from 'react-dom/server';

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
}

const LiveCanvasIframe = ({ Component, editorActive, setSelectedComponent }: LiveCanvasIframeProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    console.log("main use effect running");
    console.log("editorActive: ", editorActive);
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
            body { margin: 3; font-family: sans-serif; }
            ${editorActive ? `
              [data-editing="1"] {
                outline: 2px solid #ef4444 !important;
                cursor: crosshair;
                background: rgba(239, 68, 68, 0.05);
              }
            ` : ''}
          </style>
        </head>
        <body>
          ${componentHTML}
          <script>
            ${editorActive ? `
              // Generate DOM path for an element
              function getDOMPath(element) {
                const path = [];
                
                while (element && element.nodeType === Node.ELEMENT_NODE) {
                  let selector = element.nodeName.toLowerCase();
                  
                  // Skip html and body for cleaner paths
                  if (selector === 'html') {
                    break;
                  }
                  
                  if (element.id) {
                    // If element has ID, use it and stop
                    selector += '#' + element.id;
                    path.unshift(selector);
                    break;
                  } else {
                    // Count position among siblings of same type
                    let sibling = element;
                    let nth = 1;
                    
                    while (sibling.previousElementSibling) {
                      sibling = sibling.previousElementSibling;
                      if (sibling.nodeName.toLowerCase() === selector) {
                        nth++;
                      }
                    }
                    
                    // Add nth-child if not the first or if there are multiple of same type
                    const parent = element.parentNode;
                    const siblingsOfSameType = parent ? 
                      Array.from(parent.children).filter(child => 
                        child.nodeName.toLowerCase() === selector
                      ).length : 1;
                    
                    if (siblingsOfSameType > 1) {
                      selector += ':nth-child(' + nth + ')';
                    }
                  }
                  
                  path.unshift(selector);
                  element = element.parentNode;
                }
                
                return path.join(' > ');
              }

              function handleElementClick(event) {
                event.preventDefault();
                event.stopPropagation();
                
                // Find closest element with contenteditable
                const element = event.target.closest('[contenteditable="false"]');
                if (!element) return;

                // Remove previous selection
                document.querySelectorAll('[data-editing]').forEach(el => {
                  el.removeAttribute('data-editing');
                });
                
                // Mark this element as being edited
                element.setAttribute('data-editing', '1');

                // Generate DOM path
                const domPath = getDOMPath(element);

                // Collect element information
                const componentData = {
                  domPath: domPath,
                  tagName: element.tagName.toLowerCase(),
                  attributes: {},
                  innerHTML: element.innerHTML,
                  textContent: element.textContent,
                  classList: Array.from(element.classList)
                };

                // Collect all attributes
                Array.from(element.attributes).forEach(attr => {
                  componentData.attributes[attr.name] = attr.value;
                });

                // Send data to parent window
                window.parent.postMessage({
                  type: 'COMPONENT_SELECTED',
                  data: componentData
                }, '*');
              }

              // Add click listeners to all elements with contenteditable
              document.addEventListener('DOMContentLoaded', () => {
                const elements = document.querySelectorAll('[contenteditable="false"]');
                elements.forEach(element => {
                  element.addEventListener('click', handleElementClick);
                });
              });

              // For already loaded content (srcdoc loads immediately)
              const elements = document.querySelectorAll('[contenteditable="false"]');
              elements.forEach(element => {
                element.addEventListener('click', handleElementClick);
              });
            ` : ''}
          </script>
        </body>
      </html>
    `;

    iframeRef.current.srcdoc = html;
  }, [Component, editorActive]);

  // Listen for messages from iframe
  useEffect(() => {
    console.log("use effect running");
    if (!editorActive) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'COMPONENT_SELECTED') {
        console.log('Selected component DOM path:', event.data.data.domPath);
        setSelectedComponent(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    console.log("use effect finished running");

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [editorActive, setSelectedComponent]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full flex items-center justify-center"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

export default LiveCanvasIframe;
