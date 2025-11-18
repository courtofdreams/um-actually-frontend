import { faHandPointer } from "@fortawesome/free-solid-svg-icons/faHandPointer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const TopBar = () => {
    return (
        <div className="flex flex-row items-left p-3 border-b-1 border-gray-300 mb-4 shadow-xs">
            <FontAwesomeIcon className="text-gray-800 text-xl" icon={faHandPointer} />
            <span className="text-xl font-bold">Um, Actually?</span>
        </div>
    );
};

export default TopBar;