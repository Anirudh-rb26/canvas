import { useEffect, useState, useRef } from "react";
import { ParsedStyles } from "@/lib/types";

interface Component {
  domPath: string;
  tagName: string;
  attributes: Record<string, string>;
  innerHTML: string;
  textContent: string;
  classList: string[];
}

const parseClassList = (classList: string[]): ParsedStyles => {
  const parsed: ParsedStyles = {
    textColor: "text-black",
    backgroundColor: "bg-transparent",
    borderColor: "border-gray-200",
    textSize: "text-base",
    fontWeight: "font-normal",
    fontStyle: "not-italic",
    textAlign: "text-left",
    textDecoration: "no-underline",
    lineHeight: "leading-normal",
    letterSpacing: "tracking-normal",
    display: "block",
    flexDirection: "flex-row",
    justifyContent: "justify-start",
    alignItems: "items-stretch",
    gap: "gap-0",
    padding: "p-0",
    margin: "m-0",
    width: "w-auto",
    height: "h-auto",
    borderWidth: "border-0",
    borderRadius: "rounded-none",
    shadow: "shadow-none",
    opacity: "opacity-100",
    textTransform: "normal-case",
  };

  classList.forEach((className) => {
    // Text colors (exclude size/alignment classes)
    if (
      className.startsWith("text-") &&
      !className.match(
        /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl|left|center|right|justify|start|end)$/
      )
    ) {
      parsed.textColor = className;
    }
    // Background colors
    else if (className.startsWith("bg-")) {
      parsed.backgroundColor = className;
    }
    // Border colors (exclude border width/side classes)
    else if (
      className.startsWith("border-") &&
      !className.match(/^border(-[0-9]+)?$/) &&
      !className.match(/^border-[txbylr](-[0-9]+)?$/)
    ) {
      parsed.borderColor = className;
    }
    // Text sizes
    else if (className.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/)) {
      parsed.textSize = className;
    }
    // Font weight
    else if (
      className.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)
    ) {
      parsed.fontWeight = className;
    }
    // Font style
    else if (className.match(/^(italic|not-italic)$/)) {
      parsed.fontStyle = className;
    }
    // Text alignment
    else if (className.match(/^text-(left|center|right|justify)$/)) {
      parsed.textAlign = className;
    }
    // Text decoration
    else if (className.match(/^(underline|line-through|no-underline)$/)) {
      parsed.textDecoration = className;
    }
    // Line height
    else if (className.match(/^leading-/)) {
      parsed.lineHeight = className;
    }
    // Letter spacing
    else if (className.match(/^tracking-/)) {
      parsed.letterSpacing = className;
    }
    // Display
    else if (
      className.match(/^(block|inline-block|inline|flex|inline-flex|grid|inline-grid|hidden)$/)
    ) {
      parsed.display = className;
    }
    // Flex direction
    else if (className.match(/^flex-(row|row-reverse|col|col-reverse)$/)) {
      parsed.flexDirection = className;
    }
    // Justify content
    else if (className.match(/^justify-(start|end|center|between|around|evenly)$/)) {
      parsed.justifyContent = className;
    }
    // Align items
    else if (className.match(/^items-(start|end|center|baseline|stretch)$/)) {
      parsed.alignItems = className;
    }
    // Gap
    else if (className.match(/^gap-/)) {
      parsed.gap = className;
    }
    // Padding (keep the last padding class found)
    else if (className.match(/^p[txbylr]?-/)) {
      parsed.padding = className;
    }
    // Margin (keep the last margin class found)
    else if (className.match(/^-?m[txbylr]?-/)) {
      parsed.margin = className;
    }
    // Width
    else if (className.match(/^w-/)) {
      parsed.width = className;
    }
    // Height
    else if (className.match(/^h-/)) {
      parsed.height = className;
    }
    // Border width
    else if (className.match(/^border(-[0-9]+)?$/)) {
      parsed.borderWidth = className;
    }
    // Border radius
    else if (className.match(/^rounded/)) {
      parsed.borderRadius = className;
    }
    // Shadow
    else if (className.match(/^shadow/)) {
      parsed.shadow = className;
    }
    // Opacity
    else if (className.match(/^opacity-/)) {
      parsed.opacity = className;
    }
    // Text transform
    else if (className.match(/^(uppercase|lowercase|capitalize|normal-case)$/)) {
      parsed.textTransform = className;
    }
  });

  return parsed;
};

const defaultParsedStyles: ParsedStyles = {
  textColor: "text-black",
  backgroundColor: "bg-transparent",
  borderColor: "border-gray-200",
  textSize: "text-base",
  fontWeight: "font-normal",
  fontStyle: "not-italic",
  textAlign: "text-left",
  textDecoration: "no-underline",
  lineHeight: "leading-normal",
  letterSpacing: "tracking-normal",
  display: "block",
  flexDirection: "flex-row",
  justifyContent: "justify-start",
  alignItems: "items-stretch",
  gap: "gap-0",
  padding: "p-0",
  margin: "m-0",
  width: "w-auto",
  height: "h-auto",
  borderWidth: "border-0",
  borderRadius: "rounded-none",
  shadow: "shadow-none",
  opacity: "opacity-100",
  textTransform: "normal-case",
};

export function useManipulatedComponent(
  originalComponent: Component | undefined,
  manipulatedComponent: Component | undefined,
  setManipulatedComponent: React.Dispatch<React.SetStateAction<Component>>
) {
  const [manipulatedStyles, setManipulatedStyles] = useState<ParsedStyles>(defaultParsedStyles);
  const isUpdatingRef = useRef(false);
  const lastDomPathRef = useRef<string>("");

  // When originalComponent changes (new selection), parse and initialize manipulated styles
  useEffect(() => {
    console.log(
      "🔵 [useManipulatedComponent] originalComponent changed:",
      originalComponent?.domPath
    );
    if (originalComponent && originalComponent.domPath !== lastDomPathRef.current) {
      lastDomPathRef.current = originalComponent.domPath;
      const parsed = parseClassList(originalComponent.classList);
      console.log("🔵 [useManipulatedComponent] Initializing manipulatedStyles:", parsed);
      setManipulatedStyles({ ...parsed });
      setManipulatedComponent(originalComponent);
      isUpdatingRef.current = false;
    }
  }, [originalComponent, setManipulatedComponent]);

  // Sync manipulatedStyles to manipulatedComponent
  useEffect(() => {
    if (
      !manipulatedComponent ||
      isUpdatingRef.current ||
      manipulatedComponent.domPath !== lastDomPathRef.current
    )
      return;

    console.log("🟣 [useManipulatedComponent] Syncing manipulatedComponent with manipulatedStyles");

    const defaultValues = [
      "text-black",
      "bg-transparent",
      "border-gray-200",
      "text-base",
      "font-normal",
      "not-italic",
      "text-left",
      "no-underline",
      "leading-normal",
      "tracking-normal",
      "block",
      "flex-row",
      "justify-start",
      "items-stretch",
      "gap-0",
      "p-0",
      "m-0",
      "w-auto",
      "h-auto",
      "border-0",
      "rounded-none",
      "shadow-none",
      "opacity-100",
      "normal-case",
    ];

    const newClassList = Object.values(manipulatedStyles).filter(
      (cls) => cls && !defaultValues.includes(cls)
    );

    const newClassString = newClassList.join(" ");

    if (newClassString !== manipulatedComponent.attributes.class) {
      console.log("🟣 [useManipulatedComponent] classList changed, updating manipulatedComponent");
      console.log("🟣 [useManipulatedComponent] New classList:", newClassList);

      isUpdatingRef.current = true;
      setManipulatedComponent((prev) => ({
        ...prev,
        classList: newClassList,
        attributes: {
          ...prev.attributes,
          class: newClassString,
        },
      }));
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [manipulatedStyles, manipulatedComponent, setManipulatedComponent]);

  const updateStyle = <K extends keyof ParsedStyles>(key: K, value: string) => {
    console.log("🟢 [useManipulatedComponent] updateStyle called:", key, "=", value);

    setManipulatedStyles((prev) => {
      if (prev[key] === value) {
        console.log("🟢 [useManipulatedComponent] Value unchanged, skipping update");
        return prev;
      }
      const newStyles = { ...prev, [key]: value };
      console.log("🟢 [useManipulatedComponent] New manipulatedStyles:", newStyles);
      return newStyles;
    });
  };

  return {
    manipulatedStyles,
    updateStyle,
    setManipulatedStyles,
  };
}
