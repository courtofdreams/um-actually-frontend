import { TextAnalysisResponse } from "./anaysis";

const useAnalysisAPI = () => {


    const getTextAnalysis = async (text: string): Promise<TextAnalysisResponse> => {

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/text-analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch text analysis');
        }

        return response.json();
    }

    return { getTextAnalysis };

}

export default useAnalysisAPI;