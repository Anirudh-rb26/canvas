/* eslint-disable @typescript-eslint/no-explicit-any */
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

    let found = false;
    let matchCount = 0;

    // Traverse the AST to find and update the JSX element
    traverse(ast, {
      JSXElement(path) {
        if (found) return;

        // Check if this is the element we're looking for
        if (matchesPath(path, pathParts, matchCount)) {
          matchCount++;

          // Verify this is the exact match by checking the full path
          if (isExactPathMatch(path, pathParts)) {
            found = true;

            // Update the JSX element's attributes
            const openingElement = path.node.openingElement;

            // Clear existing attributes except ones we want to preserve
            openingElement.attributes = openingElement.attributes.filter((attr) => {
              if (attr.type === "JSXAttribute") {
                const attrName = attr.name.name as string;
                return attrName === "key" || attrName === "ref"; // Preserve React-specific attrs
              }
              return attr.type === "JSXSpreadAttribute"; // Preserve spread attributes
            });

            // Add updated attributes
            Object.entries(manipulatedComponent.attributes).forEach(([key, value]) => {
              if (key === "data-editing") return; // Skip editor-specific attributes

              if (key === "class") {
                // Handle className specially
                openingElement.attributes.push({
                  type: "JSXAttribute",
                  name: { type: "JSXIdentifier", name: "className" },
                  value: { type: "StringLiteral", value: value },
                });
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
              path.node.children.length === 1 &&
              path.node.children[0].type === "JSXText" &&
              manipulatedComponent.textContent &&
              !manipulatedComponent.innerHTML.includes("<")
            ) {
              path.node.children[0].value = manipulatedComponent.textContent;
            }
          }
        }
      },
    });

    if (!found) {
      console.warn("Could not find element at path:", manipulatedComponent.domPath);
      return codeSnippet;
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
 * Check if a JSX path matches the domPath structure (initial filter)
 */
function matchesPath(
  path: any,
  pathParts: Array<{ tag: string; id?: string; index: number }>,
  currentMatchCount: number
): boolean {
  const elementName = path.node.openingElement.name;
  const tagName = elementName.type === "JSXIdentifier" ? elementName.name.toLowerCase() : "";

  const lastPart = pathParts[pathParts.length - 1];

  // Must match tag name
  if (tagName !== lastPart.tag) {
    return false;
  }

  // If there's an ID, it must match
  if (lastPart.id) {
    const idAttr = path.node.openingElement.attributes.find(
      (attr: any) => attr.type === "JSXAttribute" && attr.name.name === "id"
    );
    if (!idAttr || idAttr.value?.value !== lastPart.id) {
      return false;
    }
  }

  return true;
}

/**
 * Verify this is the exact element by traversing up and checking the full path
 */
function isExactPathMatch(
  jsxPath: any,
  pathParts: Array<{ tag: string; id?: string; index: number }>
): boolean {
  const pathToCheck = [...pathParts].reverse(); // Start from current element
  let currentPath = jsxPath;
  let pathIndex = 0;

  while (pathIndex < pathToCheck.length && currentPath) {
    const expectedPart = pathToCheck[pathIndex];
    const elementName = currentPath.node.openingElement?.name;
    const tagName = elementName?.type === "JSXIdentifier" ? elementName.name.toLowerCase() : "";

    // Check tag name
    if (tagName !== expectedPart.tag) {
      return false;
    }

    // Check ID if specified
    if (expectedPart.id) {
      const idAttr = currentPath.node.openingElement.attributes.find(
        (attr: any) => attr.type === "JSXAttribute" && attr.name.name === "id"
      );
      if (!idAttr || idAttr.value?.value !== expectedPart.id) {
        return false;
      }
    }

    // Check index (count siblings of same type)
    if (expectedPart.index > 0) {
      const parent = currentPath.parent;
      if (parent && parent.type === "JSXElement") {
        const siblings = parent.children.filter(
          (child: any) =>
            child.type === "JSXElement" &&
            child.openingElement?.name?.name?.toLowerCase() === tagName
        );
        const currentIndex = siblings.indexOf(currentPath.node);
        if (currentIndex !== expectedPart.index) {
          return false;
        }
      }
    }

    pathIndex++;
    currentPath = currentPath.parentPath;
  }

  return pathIndex === pathToCheck.length;
}

export default updateCodeWithManipulation;
