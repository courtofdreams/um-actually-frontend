type ConfidenceCardProps = {
    index: number;
    text: string;
    confidence: number;
    confidenceReason?: string;
};

const getConfidenceColor = (confidence: number) => {
    if (confidence <= 30) return "bg-red-500";
    if (confidence <= 60) return "bg-orange-500";
    return "bg-green-500";
}

const ConfidenceCard = ({
    index,
    text,
    confidence,
    confidenceReason,
}: ConfidenceCardProps) => {

    const badgeColor = getConfidenceColor(confidence);

    return (
        <div
            className="
       group relative rounded-xl bg-white shadow-[-1px_0px_14px_-4px_rgba(0,_0,_0,_0.1)]
       px-2 py-3 flex flex-col items-center justify-between border border-gray-100 
       hover:-translate-y-1 hover:shadow-xl transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl
       -mt-3
      "
            style={{ zIndex: 0 }}
        >
            <div className="flex items-center gap-3 w-full justify-between">
                <div
                    className="
            h-10 w-10 rounded-xl bg-gray-200
            flex items-center justify-center
            text-gray-600 font-semibold
          "
                >
                    [{index + 1}]
                </div>

                <p className="text-gray-800 font-medium text-left flex-1">
                    “{text}”
                </p>
                <div
                    className={` rounded-full px-5 py-2 text-sm font-semibold text-white ${badgeColor} `}
                >
                    {confidence}% Confidence
                </div>
            </div>
            <div className="px-4 py-1 overflow-hidden transition-all duration-300 
                      max-h-0 opacity-0 group-hover:max-h-[400px] group-hover:opacity-100">
                <div>
                    <p className="text-left text-sm leading-relaxed text-gray-600">
                        {confidenceReason}

                    </p>
                </div>
            </div>
        </div>

    );
}

export default ConfidenceCard;