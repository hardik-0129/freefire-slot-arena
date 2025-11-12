import React, { useState, useRef } from 'react'
import { Download } from 'lucide-react'
import './css/HowToPlay.css'

const HowToPlay = () => {
    // First video state
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [showControls, setShowControls] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Second video state
    const [isPlaying2, setIsPlaying2] = useState(false)
    const [isMuted2, setIsMuted2] = useState(false)
    const [showControls2, setShowControls2] = useState(false)
    const videoRef2 = useRef<HTMLVideoElement>(null)

    // Third video state
    const [isPlaying3, setIsPlaying3] = useState(false)
    const [isMuted3, setIsMuted3] = useState(false)
    const [showControls3, setShowControls3] = useState(false)
    const videoRef3 = useRef<HTMLVideoElement>(null)

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const togglePlayPause2 = () => {
        if (videoRef2.current) {
            if (isPlaying2) {
                videoRef2.current.pause()
            } else {
                videoRef2.current.play()
            }
            setIsPlaying2(!isPlaying2)
        }
    }

    const toggleMute2 = () => {
        if (videoRef2.current) {
            videoRef2.current.muted = !isMuted2
            setIsMuted2(!isMuted2)
        }
    }

    const togglePlayPause3 = () => {
        if (videoRef3.current) {
            if (isPlaying3) {
                videoRef3.current.pause()
            } else {
                videoRef3.current.play()
            }
            setIsPlaying3(!isPlaying3)
        }
    }

    const toggleMute3 = () => {
        if (videoRef3.current) {
            videoRef3.current.muted = !isMuted3
            setIsMuted3(!isMuted3)
        }
    }

    const handleDownloadApk = async () => {
        try {
            const base = import.meta?.env?.VITE_API_URL;
            const res = await fetch(`${base}/api/apk/latest/public`, { method: 'GET' });
            if (res.ok) {
                const data = await res.json().catch(() => ({}));
                const url = (data && (data.downloadUrl || data.url)) ?
                    ((data.downloadUrl?.startsWith('http') || data.url?.startsWith('http')) ? (data.downloadUrl || data.url) : `${base}${data.downloadUrl || data.url}`)
                    : undefined;
                if (url) {
                    window.location.href = url;
                    return;
                }
            }
            // Fallback to static path if API fails
            window.location.href = `https://api1.alphalions.io/uploads/apk/alpha_lions_v008.apk`;
        } catch (e) {
            // Final fallback: open current known file
            const base = import.meta?.env?.VITE_API_URL || '';
            window.open(`https://api1.alphalions.io/uploads/apk/alpha_lions_v008.apk`, '_blank');
        }
    };

    return (
        <>
            <div className="how-to-play-container">
            <h1 className="title">HOW TO PLAY</h1>
            <p className="subtitle">Begin Your Game Now</p>
                <div className="container">
                <div className="section">
                    <div className="image-container">
                        <div 
                            className="video-wrapper-inline"
                            onMouseEnter={() => setShowControls(true)}
                            onMouseLeave={() => setShowControls(false)}
                            onTouchStart={() => setShowControls(true)}
                        >
                            <video 
                                ref={videoRef}
                                src="/How to us.mp4" 
                                className="image video-responsive"
                                preload="metadata"
                                aria-label="How to Play Game Tutorial Video"
                                title="How to Play Game Tutorial"
                                playsInline
                                muted={isMuted}
                                controlsList="nodownload nofullscreen noremoteplayback"
                                disablePictureInPicture
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            >
                                <source src="/How to us.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            {!isPlaying && (
                                <div className="play-button-overlay" onClick={togglePlayPause}>
                                    <button className="play-button" aria-label="Play Video">
                                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="30" cy="30" r="30" fill="rgba(0, 0, 0, 0.6)"/>
                                            <path d="M25 20L25 40L38 30L25 20Z" fill="white"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                            <div className={`custom-controls-inline ${showControls || !isPlaying ? 'show' : ''}`}>
                                <button 
                                    className="control-btn play-pause-btn" 
                                    onClick={togglePlayPause}
                                    aria-label={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                        </svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    )}
                                </button>
                                <button 
                                    className="control-btn mute-btn" 
                                    onClick={toggleMute}
                                    aria-label={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                        </svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="text-container">
                        <h2 className="subheading">How To Play</h2>
                        <h3 className="subheading">Solo Mode:</h3>
                        <ul className="list">
                            <li>You can join a tournament whatever works for you (modes: Top Position, Most Kills).</li>
                            <li>Get Price if you kill someone and get up to 50INR.</li>
                            <li>Top 3 winners get prizes up to 2000INR.</li>
                        </ul>

                        <h3 className="subheading">Duo Mode:</h3>
                        <ul className="list">
                            <li>Play PUBG with your friend and you both can win cash prizes.</li>
                            <li>Just invite your teammate and join 100-team tournament.</li>
                            <li>The top prize is up to 2000INR. It’s possible to join 3 tournaments at once.</li>
                        </ul>
                    </div>
                </div>

                <div className="section">
                    <div className="text-container">
                        <h2 className="subheading">What To Do</h2>

                        <h3 className="subheading">Registration</h3>
                        <ul className="list">
                            <li>Create a free account</li>
                            <li>Book your slote and play Free fire and BGMI on Mobile/Tablet</li>
                            <li>That’s all! You’re ready to play.</li>
                        </ul>

                        <h3 className="subheading">Additional Information</h3>
                        <ul className="list">
                            <li>FREE BGMI and Free fire tournaments are available 12hr.</li>
                            <li>We support SOLO, DUO and SQUAD modes.</li>
                            <li>When competing, always try to do your best/get more kills.</li>
                            <li>The top 3 winners get prizes up to 5000INR.</li>
                            <li>There is no limit; participate in BGMI and Free fire tournaments as often as you want.</li>
                        </ul>
                    </div>
                    <div className="image-container">
                        <div 
                            className="video-wrapper-inline"
                            onMouseEnter={() => setShowControls2(true)}
                            onMouseLeave={() => setShowControls2(false)}
                            onTouchStart={() => setShowControls2(true)}
                        >
                            <video 
                                ref={videoRef2}
                                src="/What to do.mp4" 
                                className="image video-responsive"
                                preload="metadata"
                                aria-label="What To Do Tutorial Video"
                                title="What To Do Tutorial"
                                playsInline
                                muted={isMuted2}
                                controlsList="nodownload nofullscreen noremoteplayback"
                                disablePictureInPicture
                                onPlay={() => setIsPlaying2(true)}
                                onPause={() => setIsPlaying2(false)}
                            >
                                <source src="/What to do.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            {!isPlaying2 && (
                                <div className="play-button-overlay" onClick={togglePlayPause2}>
                                    <button className="play-button" aria-label="Play Video">
                                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="30" cy="30" r="30" fill="rgba(0, 0, 0, 0.6)"/>
                                            <path d="M25 20L25 40L38 30L25 20Z" fill="white"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                            <div className={`custom-controls-inline ${showControls2 || !isPlaying2 ? 'show' : ''}`}>
                                <button 
                                    className="control-btn play-pause-btn" 
                                    onClick={togglePlayPause2}
                                    aria-label={isPlaying2 ? "Pause" : "Play"}
                                >
                                    {isPlaying2 ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                        </svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    )}
                                </button>
                                <button 
                                    className="control-btn mute-btn" 
                                    onClick={toggleMute2}
                                    aria-label={isMuted2 ? "Unmute" : "Mute"}
                                >
                                    {isMuted2 ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                        </svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="section">
                    <div className="image-container">
                        <div 
                            className="video-wrapper-inline"
                            onMouseEnter={() => setShowControls3(true)}
                            onMouseLeave={() => setShowControls3(false)}
                            onTouchStart={() => setShowControls3(true)}
                        >
                            <video 
                                ref={videoRef3}
                                src="/Money Prizes.mp4" 
                                className="image video-responsive"
                                preload="metadata"
                                aria-label="Money Prizes Tutorial Video"
                                title="Money Prizes Tutorial"
                                playsInline
                                muted={isMuted3}
                                controlsList="nodownload nofullscreen noremoteplayback"
                                disablePictureInPicture
                                onPlay={() => setIsPlaying3(true)}
                                onPause={() => setIsPlaying3(false)}
                            >
                                <source src="/Money Prizes.mp4" type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            {!isPlaying3 && (
                                <div className="play-button-overlay" onClick={togglePlayPause3}>
                                    <button className="play-button" aria-label="Play Video">
                                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="30" cy="30" r="30" fill="rgba(0, 0, 0, 0.6)"/>
                                            <path d="M25 20L25 40L38 30L25 20Z" fill="white"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                            <div className={`custom-controls-inline ${showControls3 || !isPlaying3 ? 'show' : ''}`}>
                                <button 
                                    className="control-btn play-pause-btn" 
                                    onClick={togglePlayPause3}
                                    aria-label={isPlaying3 ? "Pause" : "Play"}
                                >
                                    {isPlaying3 ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                        </svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    )}
                                </button>
                                <button 
                                    className="control-btn mute-btn" 
                                    onClick={toggleMute3}
                                    aria-label={isMuted3 ? "Unmute" : "Mute"}
                                >
                                    {isMuted3 ? (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                        </svg>
                                    ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="text-container">
                        <h2 className="subheading">Money Prizes</h2>
                        <p>
                            Once you win your first tournament, you can request your earnings to be withdrawn from your Alpha Lions Esports account.
                        </p>
                        <p>It's also possible to keep playing to get bigger prizes.</p>
                        <p>The following payment systems are supported on our website: UPI, Bank Transfer, Paytm, Google Pay and PhonePe.</p>
                    </div>
                </div>
                </div>

                <div className="download-app-container">
                    <button 
                        className="download-app-button" 
                        onClick={handleDownloadApk}
                        title="Download App"
                        aria-label="Download App"
                    >
                        <span className="download-text">Download App</span>
                        <Download className="download-icon" />
                    </button>
                </div>
            </div>
        </>
    )
}

export default HowToPlay
