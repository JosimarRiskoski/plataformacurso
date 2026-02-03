import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = forwardRef(({ url, onProgress, onEnded }, ref) => {
    const internalPlayerRef = useRef(null);

    useImperativeHandle(ref, () => ({
        getCurrentTime: () => {
            return internalPlayerRef.current ? internalPlayerRef.current.getCurrentTime() : 0;
        },
        seekTo: (seconds) => {
            if (internalPlayerRef.current) {
                internalPlayerRef.current.seekTo(seconds);
            }
        }
    }));

    // Use a ratio Wrapper for responsiveness (16:9)
    return (
        <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden shadow-lg border border-gray-800">
            <div className="absolute top-0 left-0 w-full h-full">
                <ReactPlayer
                    ref={internalPlayerRef}
                    url={url}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={false}
                    onProgress={onProgress} // Callback com { played, playedSeconds, loaded, loadedSeconds }
                    onEnded={onEnded}
                    config={{
                        youtube: {
                            playerVars: { showinfo: 1 }
                        }
                    }}
                />
            </div>
        </div>
    );
});

export default VideoPlayer;
