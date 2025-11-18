import { createContext } from "react";

export enum Screen {
  MAIN = "MAIN",
  TEXT_ANALYSIS = "TEXT_ANALYSIS",
  VIDEO_ANALYSIS = "VIDEO_ANALYSIS",
}

export type AppContextProps = {
  userInput: string;
  currentScreen: Screen;
  setCurrentScreen: (screen: Screen) => void;
  setUserInput: (input: string) => void;
};

export const AppContext = createContext<AppContextProps>({} as AppContextProps);
