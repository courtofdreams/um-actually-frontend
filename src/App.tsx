import './App.css'
import Main from './components/Main';
import VideoAnalysis from './components/VideoAnalysis';
import TextAnalysis from './components/TextAnalysis';
import { AppContext, Screen } from './contexts/AppContext';
import { JSX, useState } from 'react';

const App = () => {
  const [userInput, setUserInput] = useState("");
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.MAIN);

    const renderScreen = (): JSX.Element => {
    switch (currentScreen) {
      case Screen.MAIN:
        return <Main />;
      case Screen.VIDEO_ANALYSIS:
        return <VideoAnalysis />;
      case Screen.TEXT_ANALYSIS:
        return <TextAnalysis />;
      default:
        return <Main />;
    }
  };

  return (
    <>
      <AppContext.Provider value={{ userInput, currentScreen, setUserInput, setCurrentScreen }}>
        {renderScreen()}
      </AppContext.Provider>
    </>
  )
}

export default App
