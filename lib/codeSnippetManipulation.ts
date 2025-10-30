/* eslint-disable @typescript-eslint/no-explicit-any */
import * as t from "@babel/types";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";

/**
 * Updates the code snippet with manipulated component changes
 */
export function updateCodeWithManipulation(
  codeSnippet: string,
  manipulatedComponent: {
    domPath: string;
    tagName: string;
    attributes: Record<string, string>;
    innerHTML: string;
    textContent: string;
    classList: string[];
  },
  preset: string
): string {
  try {
    // Parse the code into AST
    const ast = parser.parse(codeSnippet, {
      sourceType: "module",
      plugins: preset === "TSX" ? ["jsx", "typescript"] : ["jsx"],
    });

    // Convert domPath to element indices
    const pathParts = parseDomPath(manipulatedComponent.domPath);

    let targetElement: any = null;
    const allMatches: any[] = [];

    // First pass: collect all elements that match the target tag
    traverse(ast, {
      JSXElement(path) {
        const elementName = path.node.openingElement.name;
        const tagName = elementName.type === "JSXIdentifier" ? elementName.name.toLowerCase() : "";
        const lastPart = pathParts[pathParts.length - 1];

        if (tagName === lastPart.tag) {
          // Check ID match if specified
          if (lastPart.id) {
            const idAttr = path.node.openingElement.attributes.find(
              (attr: any) => attr.type === "JSXAttribute" && attr.name.name === "id"
            );

            if (idAttr && idAttr.type === "JSXAttribute" && idAttr.value) {
              const val = idAttr.value;

              // Check if val is a Babel StringLiteral
              if (t.isStringLiteral(val) && val.value === lastPart.id) {
                allMatches.push(path);
              }

              // Or if val is a JSXExpressionContainer containing a StringLiteral
              else if (
                t.isJSXExpressionContainer(val) &&
                t.isStringLiteral(val.expression) &&
                val.expression.value === lastPart.id
              ) {
                allMatches.push(path);
              }
            }
          } else {
            allMatches.push(path);
          }
        }
      },
    });

    // Find the best match by checking the full path
    for (const match of allMatches) {
      if (matchesFullPath(match, pathParts)) {
        targetElement = match;
        break;
      }
    }

    if (!targetElement) {
      console.warn("Could not find element at path:", manipulatedComponent.domPath);
      return codeSnippet;
    }

    // Update the JSX element's attributes
    const openingElement = targetElement.node.openingElement;

    // Clear existing attributes except ones we want to preserve
    openingElement.attributes = openingElement.attributes.filter((attr: any) => {
      if (attr.type === "JSXAttribute") {
        const attrName = attr.name.name as string;
        return attrName === "key" || attrName === "ref"; // Preserve React-specific attrs
      }
      return attr.type === "JSXSpreadAttribute"; // Preserve spread attributes
    });

    // Add updated attributes
    Object.entries(manipulatedComponent.attributes).forEach(([key, value]) => {
      if (key === "data-editing") return; // Skip editor-specific attributes

      if (key === "class" || key === "className") {
        // Handle className specially - use the classList
        const classValue = manipulatedComponent.classList.join(" ");
        if (classValue) {
          openingElement.attributes.push({
            type: "JSXAttribute",
            name: { type: "JSXIdentifier", name: "className" },
            value: { type: "StringLiteral", value: classValue },
          });
        }
      } else if (key !== "key" && key !== "ref") {
        // Don't override key or ref
        openingElement.attributes.push({
          type: "JSXAttribute",
          name: { type: "JSXIdentifier", name: key },
          value: { type: "StringLiteral", value: value },
        });
      }
    });

    // Update children if it's simple text content
    if (
      targetElement.node.children.length === 1 &&
      targetElement.node.children[0].type === "JSXText" &&
      manipulatedComponent.textContent &&
      !manipulatedComponent.innerHTML.includes("<")
    ) {
      targetElement.node.children[0].value = manipulatedComponent.textContent;
    }

    // Generate updated code from modified AST
    const output = generate(ast, {
      retainLines: false,
      compact: false,
    });

    return output.code;
  } catch (error) {
    console.error("Error updating code:", error);
    return codeSnippet; // Return original on error
  }
}

/**
 * Parse domPath into structured format
 * Example: "div#root > div > div:nth-of-type(1)"
 */
function parseDomPath(domPath: string): Array<{ tag: string; id?: string; index: number }> {
  const parts = domPath.split(" > ").filter((p) => p.trim());

  return parts.map((part) => {
    const result: { tag: string; id?: string; index: number } = { tag: "", index: 0 };

    // Check for ID
    if (part.includes("#")) {
      const [tag, id] = part.split("#");
      result.tag = tag;
      result.id = id;
      result.index = 0;
    }
    // Check for nth-of-type
    else if (part.includes(":nth-of-type")) {
      const match = part.match(/(\w+):nth-of-type\((\d+)\)/);
      if (match) {
        result.tag = match[1];
        result.index = parseInt(match[2]) - 1; // Convert to 0-based index
      }
    }
    // Simple tag
    else {
      result.tag = part;
      result.index = 0;
    }

    return result;
  });
}

/**
 * Check if a JSX element matches the full DOM path
 */
function matchesFullPath(
  jsxPath: any,
  pathParts: Array<{ tag: string; id?: string; index: number }>
): boolean {
  // Build the path from the JSX element up to the root
  const jsxPathArray: Array<{ tag: string; id?: string; index: number }> = [];
  let currentPath = jsxPath;

  while (currentPath && currentPath.node && currentPath.node.type === "JSXElement") {
    const elementName = currentPath.node.openingElement.name;
    const tagName = elementName.type === "JSXIdentifier" ? elementName.name.toLowerCase() : "";

    // Get ID if present
    let id: string | undefined;
    const idAttr = currentPath.node.openingElement.attributes.find(
      (attr: any) => attr.type === "JSXAttribute" && attr.name.name === "id"
    );
    if (idAttr && idAttr.value?.type === "StringLiteral") {
      id = idAttr.value.value;
    }

    // Calculate index among siblings of same type
    let index = 0;
    const parent = currentPath.parent;

    if (parent && (parent.type === "JSXElement" || parent.type === "JSXFragment")) {
      const children = parent.children || [];
      const siblingsOfSameType = children.filter(
        (child: any) =>
          child.type === "JSXElement" &&
          child.openingElement?.name?.type === "JSXIdentifier" &&
          child.openingElement.name.name.toLowerCase() === tagName
      );

      if (siblingsOfSameType.length > 1) {
        index = siblingsOfSameType.indexOf(currentPath.node);
      }
    }

    jsxPathArray.unshift({ tag: tagName, id, index });

    // Move to parent JSX element
    currentPath = currentPath.parentPath;
    while (currentPath && currentPath.node && currentPath.node.type !== "JSXElement") {
      currentPath = currentPath.parentPath;
    }
  }

  // Compare paths - skip the root element in DOM path (usually div#root)
  const domPathToCompare = pathParts.slice(1); // Skip root
  const jsxPathToCompare = jsxPathArray;

  // Match from the end (most specific elements)
  const minLength = Math.min(domPathToCompare.length, jsxPathToCompare.length);

  for (let i = 0; i < minLength; i++) {
    const domPart = domPathToCompare[domPathToCompare.length - 1 - i];
    const jsxPart = jsxPathToCompare[jsxPathToCompare.length - 1 - i];

    // Tag must match
    if (domPart.tag !== jsxPart.tag) {
      return false;
    }

    // If DOM has an ID, JSX must have the same ID
    if (domPart.id && domPart.id !== jsxPart.id) {
      return false;
    }

    // If DOM specifies an index, JSX must match
    if (domPart.index > 0 && domPart.index !== jsxPart.index) {
      return false;
    }
  }

  return true;
}

export default updateCodeWithManipulation;
