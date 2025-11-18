import { useContext, useState } from 'react'
import { AppContext, Screen } from '@/contexts/AppContext';
import { DesignMark } from "@/components/assets/DesignMark";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import TypingText from "@/components/ui/shadcn-io/typing-text";

import { ArrowUpIcon } from "lucide-react";

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
        <div className={"flex flex-col items-center justify-center h-screen"}>
            <DesignMark className={"mb-6"} fill={"#000"}/>
            <p className="mb-2 text-lg">Welcome to</p>
            <p className="mb-12 text-4xl font-bold tracking-tight text-heading md:text-5xl lg:text-6xl">Um, Actually?</p>
            <InputGroup className={"w-1/2 max-w-150 relative items-start"}>
              {inputText === "" && (
                  <div className={"flex flex-row items-center justify-start absolute top-3 left-3 pointer-events-none text-base md:text-sm text-muted-foreground"}>
                    <p>Paste here&nbsp;</p>
                    <TypingText
                      text={["a YouTube link", "a whole article", "a link to a blog post"]}
                      typingSpeed={75}
                      pauseDuration={1500}
                      showCursor={false}
                      cursorCharacter="|"
                      variableSpeed={{min: 50, max: 120}}
                    />
                  </div>
              )}
              <InputGroupTextarea
                  name={"userInput"}
                  value={inputText}
                  onChange={updateText}
              />
              <InputGroupAddon align="block-end" className={"justify-end"}>
                <InputGroupButton
                  variant="default"
                  className="rounded-full"
                  size="icon-xs"
                  onClick={determineInputType}
                  disabled={inputText.trim() === ""}
                >
                  <ArrowUpIcon />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
        </div>
    )
}

export default Main;
