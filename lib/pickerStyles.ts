export const pickerStyles = {
  default: {
    picker: {
      background: "hsl(var(--background))",
      borderRadius: "0.5rem",
      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      padding: "0.75rem",
      border: "1px solid hsl(var(--border))",
      fontFamily: "inherit",
      width: "100%",
      boxSizing: "border-box",
    },
    saturation: {
      paddingBottom: "55%",
      position: "relative",
      borderRadius: "0.375rem",
      overflow: "hidden",
      marginBottom: "0.75rem",
    },
    // Removed nested keys like Saturation, Hue, Alpha
    controls: {
      display: "flex",
      boxSizing: "border-box",
    },
    sliders: {
      flex: "1",
      minWidth: 0,
    },
    color: {
      width: 24,
      height: 24,
      borderRadius: "0.25rem",
      marginLeft: "0.75rem",
      flexShrink: 0,
      border: "none",
      boxShadow: "0 0 0 1px hsl(var(--border)) inset, 0 1px 2px 0 rgb(0 0 0 / 0.05)",
    },
    activeColor: {
      position: "absolute",
      inset: "0",
      borderRadius: "0.25rem",
      boxShadow: "0 0 0 1px hsl(var(--border)) inset",
    },
    hue: {
      position: "relative",
      height: 10,
      borderRadius: "9999px",
      marginBottom: "0.75rem",
      overflow: "hidden",
    },
    alpha: {
      position: "relative",
      height: 10,
      borderRadius: "9999px",
      overflow: "hidden",
    },
  },
};
