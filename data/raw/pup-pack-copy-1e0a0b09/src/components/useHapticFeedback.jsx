import React from "react";

// Global Haptic Feedback Hook, now in a valid location.
export const useHapticFeedback = () => {
  React.useEffect(() => {
    if (!window.hapticFunctions) {
      const script = document.createElement("script");
      script.type = "module";
      script.innerHTML = `
        import { detectOS } from "https://esm.sh/is-device";
        import { haptic } from "https://esm.sh/ios-haptics";

        window.hapticFunctions = {
          default: haptic.confirm,
          isIOS: detectOS() === "ios"
        };
      `;
      document.head.appendChild(script);
    }
  }, []);

  const triggerHaptic = React.useCallback(() => {
    if (window.hapticFunctions && window.hapticFunctions.isIOS) {
      window.hapticFunctions.default();
    } else if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  return triggerHaptic;
};