import { useRokiStore, useUIStateStore } from "@/state/rokiStore";
import * as config from "common/config";
import { BrowserWindow, ipcRenderer } from "electron";

import debounce from "just-debounce";
import { useEffect } from "react"
import { calculateMaxVisibleResults } from "../components/Roki/utils";

export const useEventsSubscription = (electronWindow: BrowserWindow, mainInput: any) => {
    const setMaxVisibleResults = useUIStateStore(s => s.setMaxVisibleResults)
    const [results, updateTerm] = useRokiStore(s => [s.results, s.updateTerm])

    /**
   * Change count of visible results depends on window size
   */
    const handleResize = debounce(() => {
        const newMaxVisibleResults = calculateMaxVisibleResults(results.length);
        setMaxVisibleResults(newMaxVisibleResults);
    }, 200);

    const onDocumentKeydown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          // TODO - Use references instead of getElementById
          (document.getElementById("main-input") as HTMLInputElement).focus();
        }
      };

      const handleShowEvent = () => {
        mainInput.current?.focus();
        if (config.get("selectOnShow")) {
          mainInput.current?.select();
        }
      };

    const cleanup = () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("keydown", onDocumentKeydown);
        window.removeEventListener("beforeunload", cleanup);
        electronWindow.removeAllListeners("show");
        ipcRenderer.removeAllListeners("clearInput");
        ipcRenderer.removeAllListeners("showTerm");
      };

    useEffect(() => {
        if(!mainInput) return

        // Listen for window.resize and change default space for results to user's value
        window.addEventListener("resize", handleResize);
        // Add some global key handlers
        window.addEventListener("keydown", onDocumentKeydown);
        // Cleanup event listeners on unload
        // NOTE: when page refreshed (location.reload) componentWillUnmount is not called
        window.addEventListener("beforeunload", cleanup);
        electronWindow.on("show", handleShowEvent);
        ipcRenderer.on("clearInput", () => {
            updateTerm("");
        });
        ipcRenderer.on("showTerm", (_, term) => {
            updateTerm(term);
        });

        // function to be called when unmounted
        return () => {
            cleanup();
        };
    }, [mainInput]);

}
