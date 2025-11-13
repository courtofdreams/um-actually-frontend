import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHandPointer } from '@fortawesome/free-solid-svg-icons/faHandPointer'
import { useContext, useState } from 'react'
import { AppContext, Screen } from '../contexts/AppContext';

const Main = () => {
    const [inputText, setInputText] = useState("");
    const {setUserInput, setCurrentScreen } = useContext(AppContext);

    const isYoutubeUrl = (text: string) => {
        return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(text);
    }

    const isURL = (text: string) => {
        return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(text);
    }

    const updateText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputText(event.target.value);
    }

    const determineInputType = () => {
        if (isYoutubeUrl(inputText)) {
            setUserInput(inputText);
            setCurrentScreen(Screen.VIDEO_ANALYSIS);
            return;
        }

        if (!isURL(inputText)) {
            setUserInput(inputText);
            setCurrentScreen(Screen.TEXT_ANALYSIS);
            return;

        }

        alert("Please enter a valid YouTube URL or text input.");
        return;

    }

    return (
        <>
            <div className="flex flex-col items-center justify-center h-screen">
                <FontAwesomeIcon className="text-gray-800 text-4xl mb-3" icon={faHandPointer} />
                <h2 className="text-lg">Welcome to </h2>
                <h1 className="font-bold mt-3 mb-6">Um, Actually?</h1>
                <textarea name="userInput" className="textarea-primary w-lg" rows={2} placeholder="Enter Youtube URL or Text" value={inputText} onChange={updateText}> </textarea>
                <button className="primary-button mt-4" onClick={determineInputType}>Submit</button>
            </div>
        </>
    )
}

export default Main;
