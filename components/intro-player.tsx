"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX, RotateCcw } from "lucide-react";

function clock(seconds: number) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

export function IntroPlayer({ source, onReplace }: { source: string | null; onReplace: () => void }) {
  const player = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [full, setFull] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [error, setError] = useState("");
  const videoSource = source || "/media/intro-preview.mp4";

  function hideControls() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setControlsVisible(false);
  }
  function showControls() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setControlsVisible(true);
    hideTimer.current = setTimeout(() => {
      // Keep a scrub or an open speed selector usable until interaction finishes.
      if (frame.current?.querySelector(".cinema-controls :active")) { showControls(); return; }
      setControlsVisible(false);
    }, 2000);
  }
  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current); }, []);

  useEffect(() => {
    hideControls();
    setReady(true);
    setPlaying(false); setEnded(false); setError(""); setTime(0); setDuration(0); setRate(1); setMuted(false);
    setCanFullscreen(Boolean(document.fullscreenEnabled || (player.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen));
    const change = () => setFull(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, [videoSource]);

  async function toggle() {
    const video = player.current;
    if (!video) return;
    if (!video.paused) { video.pause(); return; }
    setError("");
    try { if (video.ended) video.currentTime = 0; await video.play(); }
    catch { setError("Playback couldn’t start. Please try again or choose another MP4 file."); }
  }
  function seek(value: number) {
    if (!player.current || !duration) return;
    const next = Math.min(duration, Math.max(0, value));
    player.current.currentTime = next; setTime(next);
  }
  function sound() {
    if (player.current) player.current.muted = !player.current.muted;
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (frame.current?.requestFullscreen) await frame.current.requestFullscreen();
      else (player.current as HTMLVideoElement & { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen?.();
    } catch { setError("Fullscreen isn’t available in this browser. You can still watch the video here."); }
  }

  return <div className="intro-player">
    <div ref={frame} className={`intro-frame has-intro-video cinema-player ${controlsVisible ? "controls-visible" : "controls-hidden"} ${playing ? "is-playing" : "is-paused"}`} onPointerMove={event => { if (event.pointerType !== "touch") showControls(); }} onPointerLeave={event => { if (!event.buttons && event.pointerType !== "touch") hideControls(); }} onPointerDown={event => { if (event.pointerType !== "touch") showControls(); }} tabIndex={0} role="group" aria-label="Introduction video player. Space to play or pause, arrow keys to seek, M to mute, F for fullscreen." onKeyDown={event => {
      showControls();
      if (event.target !== event.currentTarget) return;
      if ([" ", "k", "ArrowLeft", "ArrowRight", "m", "f"].includes(event.key)) event.preventDefault();
      if (event.key === " " || event.key === "k") void toggle();
      if (event.key === "ArrowLeft") seek(time - 5);
      if (event.key === "ArrowRight") seek(time + 5);
      if (event.key === "m") sound();
      if (event.key === "f") void fullscreen();
    }}>
      <video key={videoSource} ref={player} src={videoSource} poster={source ? undefined : "/media/intro-preview-poster.jpg"} className={`intro-video ${source ? "" : "intro-video-sample"}`} controls={!ready} playsInline preload="metadata" aria-label={source ? "Introduction video preview" : "Sample motion reel"}
        onClick={() => {
          if (window.matchMedia("(hover: none)").matches && !controlsVisible) { showControls(); return; }
          showControls(); void toggle();
        }} onLoadedMetadata={event => setDuration(event.currentTarget.duration)} onDurationChange={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
        onTimeUpdate={event => setTime(event.currentTarget.currentTime)} onPlay={() => {setPlaying(true);setEnded(false);}} onPause={() => setPlaying(false)} onEnded={() => {setPlaying(false);setEnded(true);}} onVolumeChange={event => setMuted(event.currentTarget.muted)} onError={() => setError("This video couldn’t load. Please try an MP4 file.")}>
        Your browser does not support this video.
      </video>
      {ready && <>
        {!playing && !error && <button type="button" className="intro-play-toggle cinema-play" aria-label={ended ? "Replay video" : "Play video"} onClick={() => void toggle()}>{ended ? <RotateCcw size={25}/> : <Play size={25} fill="currentColor" strokeWidth={0}/>}</button>}
        <div className="cinema-controls" onPointerDown={showControls} onPointerUp={showControls} onChange={showControls}>
          <input className="cinema-seek" type="range" min={0} max={duration || 1} step={0.1} value={Math.min(time, duration || 1)} disabled={!duration} onChange={event => seek(Number(event.target.value))} aria-label="Seek video" aria-valuetext={`${clock(time)} of ${clock(duration)}`} style={{background: `linear-gradient(to right, #fff ${duration ? time / duration * 100 : 0}%, #ffffff45 0)`}}/>
          <div className="cinema-control-row">
            <button type="button" aria-label={playing ? "Pause video" : ended ? "Replay video" : "Play video"} onClick={() => void toggle()}>{playing ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}</button>
            <button type="button" aria-label={muted ? "Unmute video" : "Mute video"} aria-pressed={muted} onClick={sound}>{muted ? <VolumeX size={20}/> : <Volume2 size={20}/>}</button>
            <span className="cinema-time">{clock(time)} <span>/ {clock(duration)}</span></span>
            <label className="cinema-speed"><span className="sr-only">Playback speed</span><select value={rate} onChange={event => { const next = Number(event.target.value); setRate(next); if(player.current) player.current.playbackRate=next; }}>{[0.5,1,1.25,1.5,2].map(speed=><option key={speed} value={speed}>{speed}×</option>)}</select></label>
            {canFullscreen && <button type="button" aria-label={full ? "Exit fullscreen" : "Enter fullscreen"} onClick={() => void fullscreen()}>{full ? <Minimize size={20}/> : <Maximize size={20}/>}</button>}
          </div>
        </div>
      </>}
      {error && <div className="intro-player-error" role="alert"><p>{error}</p><div><button type="button" onClick={() => {setError("");void toggle();}}>Try again</button><button type="button" onClick={onReplace}>Choose a video</button></div></div>}
    </div>
  </div>;
}
