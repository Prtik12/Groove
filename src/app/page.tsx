"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Volume2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  album_image: string;
  audio: string;
}

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tracks, setTracks] = useState<JamendoTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const API_KEY = process.env.NEXT_PUBLIC_JAMENDO_API_KEY;
        const res = await fetch(
          `https://api.jamendo.com/v3.0/tracks/?client_id=${API_KEY}&format=json&limit=25`,
        );
        const data: { results: JamendoTrack[] } = await res.json();
        setTracks(data.results);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    }
    fetchTracks();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }
  }, [audio, isPlaying]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [togglePlayPause]);

  const playTrack = (index: number) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const track = tracks[index];
    const newAudio = new Audio(track.audio);
    newAudio.volume = volume;

    newAudio.onended = () => {
      if (isRepeating) {
        newAudio.currentTime = 0;
        newAudio.play();
      } else {
        nextTrack();
      }
    };

    newAudio.onplay = () => setIsPlaying(true);
    newAudio.onpause = () => setIsPlaying(false);
    newAudio.ontimeupdate = () => {
      setProgress(newAudio.currentTime);
      setDuration(newAudio.duration || 0);
    };

    setAudio(newAudio);
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    newAudio.play();
  };

  const nextTrack = () => {
    let nextIndex;
    if (isShuffling) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % tracks.length;
    }
    playTrack(nextIndex);
  };

  const prevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrack(prevIndex);
  };

  const toggleRepeat = () => {
    setIsRepeating(!isRepeating);
  };

  const toggleShuffle = () => {
    setIsShuffling(!isShuffling);
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (audio) {
      const newTime = Number(event.target.value);
      audio.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  if (status !== "authenticated") return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 relative">
      <div className="absolute top-4 right-4">
        <Avatar>
          <AvatarImage src={session?.user?.image || ""} alt="User Avatar" />
          <AvatarFallback>
            {session?.user?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-center">🎵 Groove</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
        {tracks.map((track, index) => (
          <Card
            key={track.id}
            className="bg-gray-900 hover:bg-gray-800 cursor-pointer shadow-lg rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            onClick={() => playTrack(index)}
          >
            <CardContent className="p-2 flex flex-col items-center">
              <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                <Image
                  src={track.album_image}
                  alt={track.name}
                  layout="fill"
                  className="rounded-lg object-cover"
                  unoptimized
                />
              </div>
              <p className="text-sm font-semibold mt-2 text-center">
                {track.name}
              </p>
              <p className="text-xs text-gray-400 text-center">
                {track.artist_name}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {tracks.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-gray-900 p-4 shadow-lg flex flex-col">
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={progress}
            onChange={handleSeek}
            className="w-full mb-2"
          />
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {tracks[currentTrackIndex] && (
                <>
                  <Image
                    src={tracks[currentTrackIndex].album_image}
                    alt={tracks[currentTrackIndex].name}
                    width={40}
                    height={40}
                    className="rounded-md"
                  />
                  <p className="text-sm font-medium">
                    {tracks[currentTrackIndex].name}
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={toggleShuffle}>
                <Shuffle size={20} />
              </Button>
              <Button variant="ghost" onClick={prevTrack}>
                <SkipBack size={20} />
              </Button>
              <Button variant="ghost" onClick={togglePlayPause}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </Button>
              <Button variant="ghost" onClick={nextTrack}>
                <SkipForward size={20} />
              </Button>
              <Button variant="ghost" onClick={toggleRepeat}>
                <Repeat size={20} />
              </Button>
              <Volume2 size={20} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
