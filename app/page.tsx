"use client";

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CircleHelp, Forward, MusicIcon, Play, Rewind, Settings, Upload, Volume } from "lucide-react"
import React, { useEffect, useState } from 'react'
import toWav from 'audiobuffer-to-wav';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const page = () => {

  const [audio, setAudio] = useState<File>();
  const [start, setStart] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [end, setEnd] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [trimmedAudioUrl, setTrimmedAudioUrl] = useState<string>();
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);


  const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const audio = e.target?.files?.[0];
    setAudio(audio)

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    if (audio) {
      const url = URL.createObjectURL(audio);
      setAudioUrl(url);

      const audioObj = new Audio(url);
      audioObj.onloadedmetadata = function () {
        setDuration(audioObj.duration)
      };

      const arrayBuffer = await audio.arrayBuffer();
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);
      context.decodeAudioData(arrayBuffer, (buffer) => {
        setAudioBuffer(buffer);
        console.log('Audio loaded and decoded');
      });
    } else {
      setAudioUrl(undefined);
    }
  }

  console.log(audioUrl);
  console.log(audio);

  const trimmedBufferToUrl = (buffer: AudioBuffer) => {
    const wav = toWav(buffer);
    const blob = new Blob([new DataView(wav)], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    return url;
  };

  const handleTrim = () => {
    if (!audioBuffer || !audioContext) {
      console.log('No audio loaded');
      return;
    }

    const startOffset = start; // Start trimming
    const endOffset = end; // End trimming

    const trimmedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      (endOffset - startOffset) * audioBuffer.sampleRate,
      audioBuffer.sampleRate
    );

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      const channelData = audioBuffer.getChannelData(i);
      const trimmedChannelData = trimmedBuffer.getChannelData(i);
      for (let j = 0; j < trimmedChannelData.length; j++) {
        trimmedChannelData[j] = channelData[j + startOffset * audioBuffer.sampleRate];
      }
    }

    const trimmedUrl = trimmedBufferToUrl(trimmedBuffer)
    setTrimmedAudioUrl(trimmedUrl)
    // playBuffer(trimmedBuffer);
  };

  const playBuffer = (buffer: AudioBuffer) => {
    if (!audioContext) return;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
  };


  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-900 text-gray-500">

      <main className="flex-1 px-6 py-8">

        {!audioUrl ?
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-8">

            <div className="flex items-center gap-3 mt-20">
              <MusicIcon className="h-10 w-10 text-emerald-500" />
              <span className="text-4xl text-white font-bold">Audio Trimmer</span>
            </div>

            <div className="text-2xl text-gray-400 flex items-center justify-center">
              Free editor to trim and cut any audio file online
            </div>

            <Input
              type="file"
              accept="audio/*"
              id="audio"
              className="hidden"
              onChange={
                (e) => {
                  e.target?.files?.[0];
                  handleOnChange(e);
                }
              }
            />
            <Label
              className="cursor-pointer border-2 border-emerald-500 text-md text-gray-400 rounded-xl p-2"
              htmlFor="audio"
            >
              {audio?.name || "Select an Audio"}
            </Label>

          </div>
          :
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-8">

            <audio controls>
              <source src={trimmedAudioUrl ? trimmedAudioUrl : audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>

            <Input type="number" value={start} onChange={(e) => setStart(Number(e.target.value))} />
            <Input type="number" value={end} onChange={(e) => setEnd(Number(e.target.value))} />
            <Button onClick={handleTrim}>Cut</Button>
            {trimmedAudioUrl && <a href={trimmedAudioUrl} download>Download</a>}

          </div>
        }

      </main>

    </div>

  )
}

export default page;
