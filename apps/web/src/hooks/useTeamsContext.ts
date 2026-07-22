import { useState, useEffect } from "react";
// import * as microsoftTeams from "@microsoft/teams-js"; // Uncomment when teams-js is installed

export function useTeamsContext() {
  const [isInTeams, setIsInTeams] = useState(false);
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    const initializeTeams = async () => {
      try {
        // Mocking the Teams context detection for now.
        // In real deployment, we check microsoftTeams.app.isInitialized()
        // and await microsoftTeams.app.initialize();
        const inTeamsUrl = window.location.search.includes("inTeams=true");
        if (inTeamsUrl) {
          setIsInTeams(true);
          setTheme("dark"); // Example theme
        }
      } catch (err) {
        console.error("Failed to initialize Teams JS SDK", err);
      }
    };
    initializeTeams();
  }, []);

  return { isInTeams, theme };
}
