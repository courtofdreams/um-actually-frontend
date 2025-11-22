import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StanceBadge, { Stance } from "./StanceBadge";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons/faArrowUpRightFromSquare";
import { Button } from "./ui/button";

type SourceCardProps = {
    claimReference?: string;
    title: string;
    url: string;
    ratingStance: string;
    ratingReason?: string;
    snippet?: string;
    datePosted?: string;
    index: number;
    zIndex: number;
};

const stanceMapping: Record<string, Stance> = {
    "Partial Support": "partial",
    "Mostly Support": "mostly",
    "Oppose": "opposite",
    "mostly": "mostly",
    "partial": "partial",
    "opposite": "opposite",
};

const logoMapping: Record<string, string> = {
    "BBC news": "/images/bbc.png",
    "New York Times": "/images/nyt.png",
    "NBC News": "/images/nbc.png",
    "CNN News": "/images/cnn.png",
    "Fox News": "/images/fox.png",
};

const SourceCard = ({ claimReference, title, url, ratingStance, snippet, datePosted, index }: SourceCardProps) => {

    const openLink = () => {
        window.open(url, "_blank");
    };

    const getLogoMapping = (title: string) => {
        return logoMapping[title] || "/images/undefined-source.png";
    }

    return (
        <div
            className="p-2 group relative rounded-xl bg-white border border-gray-100 shadow-[-1px_0px_14px_-4px_rgba(0,_0,_0,_0.1)] transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-[-1px_0px_14px_-4px_rgba(0,_0,_0,_0.1)] -mt-3"
            style={{ zIndex: index + 1 }}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <img className="w-8 h-8 rounded-full" src={getLogoMapping(title)} />
                    <div>
                        <div className="text-left text-sm font-semibold text-gray-900">
                            {title}
                        </div>
                        <div className="text-xs text-gray-500">
                            {datePosted}
                        </div>
                    </div>
                </div>

                <StanceBadge stance={stanceMapping[ratingStance] || "undefined"} />
            </div>

            <div className="px-4 py-3 overflow-hidden transition-all duration-300 
                      max-h-0 opacity-0 group-hover:max-h-[400px] group-hover:opacity-100">
                <div>
                    {claimReference && <h2 className="text-lg font-semibold text-gray-900 mb-1">
                        {claimReference}
                    </h2>
                    }
                    <p className="text-left text-sm leading-relaxed text-gray-600">
                        {snippet}

                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                     <Button onClick={openLink} variant="secondary" size="sm" className="rounded-full">
                        See detailed rating
                     </Button>
                    <Button onClick={openLink} variant="default" size="sm" className="rounded-full">
                        <FontAwesomeIcon className="h-4 w-4" icon={faArrowUpRightFromSquare} />
                        Read article
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default SourceCard;