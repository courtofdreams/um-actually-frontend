import TopBar from "./TopBar";
import VideoPlayer from "./VideoPlayer";
import Transcript from "./Transcript";
import SourceCard from "./SourceCard";
import ConfidenceCard from "./ConfidenceCard";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../contexts/AppContext";
import { fetchYoutubeTranscript } from "../services/youtubeTranscript";

interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  claim?: string;
  claimIndex?: number;
}

// Mock data for video analysis
const mockVideoData = {
  confidenceScores: 72,
  reasoning: "Based on the video transcript analysis, several claims were fact-checked against reliable sources. The confidence score reflects the overall accuracy of statements made in the video.",
  transcript: [
    { id: "seg1", text: "The Earth's average temperature has increased", startTime: 0, endTime: 5, claim: "true", claimIndex: 0 },
    { id: "seg2", text: "by approximately 1.1 degrees Celsius since pre-industrial times.", startTime: 5, endTime: 10 },
    { id: "seg3", text: "This warming is primarily caused by human activities", startTime: 10, endTime: 15, claim: "true", claimIndex: 1 },
    { id: "seg4", text: "including the burning of fossil fuels and deforestation.", startTime: 15, endTime: 20 },
    { id: "seg5", text: "The arctic ice is melting at an unprecedented rate,", startTime: 20, endTime: 25, claim: "true", claimIndex: 2 },
    { id: "seg6", text: "losing about 13% of its mass per decade.", startTime: 25, endTime: 30 },
    { id: "seg7", text: "Sea levels have risen by about 8-9 inches since 1880.", startTime: 30, endTime: 35, claim: "true", claimIndex: 3 },
    { id: "seg8", text: "This is mainly due to thermal expansion and melting ice sheets.", startTime: 35, endTime: 40 },
  ] as TranscriptSegment[],
  sourcesList: [
    {
      claim: "[1] The Earth's average temperature has increased by approximately 1.1°C",
      confidenceReason: "Backed by NASA, NOAA, and IPCC data. Multiple independent measurements confirm this trend.",
      ratingPercent: 95,
      sources: [
        { title: "NASA", claimReference: "[1] Earth Temperature Rise", url: "https://climate.nasa.gov", ratingStance: "Mostly Support", snippet: "NASA satellite data shows Earth's average temperature has risen about 1.1°C since pre-industrial times, with most warming occurring in the past 50 years.", datePosted: "October 2024" },
        { title: "NOAA", url: "https://www.noaa.gov", ratingStance: "Mostly Support", snippet: "NOAA's Global Monitoring Laboratory confirms consistent warming trends across multiple temperature datasets.", datePosted: "September 2024" }
      ]
    },
    {
      claim: "[2] Human activities are the primary cause of global warming",
      confidenceReason: "Overwhelming scientific consensus (97%+) supports anthropogenic climate change. Detailed in IPCC reports.",
      ratingPercent: 97,
      sources: [
        { title: "IPCC", url: "https://www.ipcc.ch", ratingStance: "Mostly Support", snippet: "The IPCC Sixth Assessment Report confirms that human influence on the climate system is unequivocal.", datePosted: "August 2023" },
        { title: "Scientific American", url: "https://scientificamerican.com", ratingStance: "Mostly Support", snippet: "97% of climate scientists agree that climate change is real and caused primarily by human activities.", datePosted: "March 2024" }
      ]
    },
    {
      claim: "[3] Arctic ice is melting at unprecedented rates",
      confidenceReason: "Satellite data shows 13% per decade loss. This is the highest rate in recorded history.",
      ratingPercent: 92,
      sources: [
        { title: "National Snow and Ice Data Center", url: "https://nsidc.org", ratingStance: "Mostly Support", snippet: "Arctic sea ice extent has declined at a rate of about 13% per decade over the satellite record.", datePosted: "July 2024" },
        { title: "Nature Climate Change", url: "https://nature.com", ratingStance: "Mostly Support", snippet: "Recent studies confirm accelerating Arctic ice loss with significant implications for global weather patterns.", datePosted: "May 2024" }
      ]
    },
    {
      claim: "[4] Sea levels have risen by 8-9 inches since 1880",
      confidenceReason: "Tide gauge and satellite data consistently show this rise. Rate of rise is accelerating.",
      ratingPercent: 94,
      sources: [
        { title: "USGS", url: "https://usgs.gov", ratingStance: "Mostly Support", snippet: "Global mean sea level has risen about 8-9 inches since 1880, with the rate of rise increasing in recent decades.", datePosted: "June 2024" },
        { title: "Scripps Institution", url: "https://scripps.ucsd.edu", ratingStance: "Mostly Support", snippet: "Combined satellite and tide gauge data confirm sea level rise of approximately 3.4mm per year.", datePosted: "April 2024" }
      ]
    }
  ]
};

// Helper function to generate dummy source cards from claims
const generateSourcesForClaim = (claim: string, claimIndex: number) => {
  const sourceNames = ["BBC News", "Reuters", "Associated Press", "NPR", "The Guardian", "CNN", "TechCrunch", "Wired"];
  const stances = ["Mostly Support", "Partial Support", "Oppose", "No Relationship"];

  return {
    claim: `[${claimIndex + 1}] ${claim}`,
    confidenceReason: `This claim was analyzed and cross-referenced with multiple sources. The confidence level reflects the consistency across fact-checking sources.`,
    ratingPercent: 70 + Math.random() * 25, // 70-95%
    sources: [
      {
        title: sourceNames[Math.floor(Math.random() * sourceNames.length)],
        url: "https://example.com/" + Math.random().toString(36).substring(7),
        ratingStance: stances[Math.floor(Math.random() * stances.length)],
        snippet: `This source provides information related to: "${claim.substring(0, 50)}...". The article discusses relevant details and context.`,
        datePosted: `${Math.floor(Math.random() * 12) + 1} month${Math.random() > 0.5 ? 's' : ''} ago`
      },
      {
        title: sourceNames[Math.floor(Math.random() * sourceNames.length)],
        url: "https://example.com/" + Math.random().toString(36).substring(7),
        ratingStance: stances[Math.floor(Math.random() * stances.length)],
        snippet: `According to this source, ${claim.substring(0, 40).toLowerCase()}... is an important topic that has been discussed extensively.`,
        datePosted: `${Math.floor(Math.random() * 12) + 1} month${Math.random() > 0.5 ? 's' : ''} ago`
      }
    ]
  };
};

const VideoAnalysis = () => {
  const { userInput } = useContext(AppContext);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSources, setShowSources] = useState(false);
  const [selectedClaimIndex, setSelectedClaimIndex] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>(mockVideoData.transcript);
  const [sources, setSources] = useState<any[]>(mockVideoData.sourcesList);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch real transcript when video URL changes
  useEffect(() => {
    if (!userInput) return;

    const loadTranscript = async () => {
      setLoading(true);
      setError(null);
      const result = await fetchYoutubeTranscript(userInput);

      if (result.error) {
        setError(result.error);
        // Fall back to mock data
        setTranscript(mockVideoData.transcript);
        setSources(mockVideoData.sourcesList);
      } else if (result.segments && result.segments.length > 0) {
        setTranscript(result.segments);

        // Generate dummy sources for each claim in the transcript
        const claimsInTranscript = result.segments.filter((seg) => seg.claim);
        const generatedSources = claimsInTranscript.map((seg, index) =>
          generateSourcesForClaim(seg.claim || "", index)
        );
        setSources(generatedSources);
      } else {
        // Use mock data if no segments returned
        setTranscript(mockVideoData.transcript);
        setSources(mockVideoData.sourcesList);
      }
      setLoading(false);
    };

    loadTranscript();
  }, [userInput]);

  const handleClaimClick = (claimIndex: number) => {
    setSelectedClaimIndex(claimIndex);
    setShowSources(true);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  return (
    <>
      <TopBar />
      <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Fixed Header - Video Player (40% width, centered) */}
        <div style={{
          flexShrink: 0,
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <div style={{
            width: '90%',
            // maxWidth: '600px',
          }}>
            <VideoPlayer videoUrl={userInput} onTimeUpdate={handleTimeUpdate} />
          </div>
        </div>

        {/* Scrollable Content Area - Transcript centered with overlays on left and right */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          padding: '8px',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
        }}>
          {/* Transcript Column (40% width, centered, scrollable) */}
          <div style={{
            width: '60%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
          }}>
            {loading && <p className="text-gray-500 text-center py-4">Loading transcript...</p>}
            {error && <p className="text-red-500 text-center py-4">Error loading transcript: {error}</p>}
            {!loading && (
              <Transcript
                segments={transcript}
                currentTime={currentTime}
                onClaimClick={handleClaimClick}
              />
            )}
          </div>
        </div>

        {/* Overlay - Confidence Score (fixed positioned on left, starts below video) */}
        <div style={{
          position: 'fixed',
          left: '24px',
          top: '24px',
          width: '20%',
          minWidth: '250px',
          maxWidth: '350px',
          height: 'auto',
          overflow: 'y-auto',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 20,
          padding: '16px',
          paddingTop: '70px'
        }}>
          <div className="content-box flex flex-col p-6 mb-6">
            <p className="text-left font-bold mb-1">Confidence Score: {mockVideoData.confidenceScores}%</p>
            <div className="progress-bar mb-4">
              <div className="progress-fill" style={{ width: `${mockVideoData.confidenceScores}%` }}></div>
            </div>
            <p className="text-left font-bold mb-1">Confidence Score Summary (Reasoning)</p>
            <p className="text-left mb-6">{mockVideoData.reasoning}</p>
          </div>
        </div>

        {/* Overlay - Source Cards (fixed positioned from right, floats beside transcript) */}
        {showSources && (
          <div style={{
            position: 'fixed',
            right: '24px',
            top: '24px',
            width: '20%',
            minWidth: '250px',
            maxWidth: '350px',
            height: 'auto',
            overflow: 'y-auto',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 20,
            padding: '16px',
            paddingTop: '100px'
          }}>
            {selectedClaimIndex !== null && sources[selectedClaimIndex] && (
              <div className="mb-6">
                <div className="relative flex flex-col my-2">
                  <ConfidenceCard
                    index={selectedClaimIndex}
                    text={sources[selectedClaimIndex].claim}
                    confidence={Math.round(sources[selectedClaimIndex].ratingPercent)}
                    confidenceReason={sources[selectedClaimIndex].confidenceReason}
                  />
                  {sources[selectedClaimIndex].sources.map((source: any, srcIndex: number) => (
                    <SourceCard
                      index={srcIndex}
                      zIndex={sources[selectedClaimIndex].sources.length - srcIndex}
                      key={srcIndex}
                      title={source.title}
                      url={source.url}
                      ratingStance={source.ratingStance}
                      snippet={source.snippet}
                      datePosted={source.datePosted}
                      claimReference={source.claimReference}
                    />
                  ))}
                </div>
              </div>
            )}

            {selectedClaimIndex === null && (
              <p className="text-gray-500 text-center py-8">Click on a highlighted claim to see sources</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default VideoAnalysis;