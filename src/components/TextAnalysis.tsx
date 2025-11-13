import TopBar from "./TopBar"

const TextAnalysis = () => {
    return <>
        <TopBar />
        <div className="p-6 flex flex-col">
            <p className="text-left font-bold">Confidence Score: {mockData.confidenceScores}%</p>
            <div className="w-full bg-neutral-quaternary rounded-full h-2">
                <div className="bg-brand h-2 rounded-full " style={{ width: `${mockData.confidenceScores}%` }}></div>
            </div>
        </div>
    </>;
}

export default TextAnalysis