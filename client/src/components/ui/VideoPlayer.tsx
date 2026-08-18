import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import api from "../../lib/axios/axios";
import { API_ROUTES } from "../../lib/api";
import { userStore } from "../../state/global";

interface VideoPlayerProps {
  url: string;
  lessonId?: string;
  videoId?: string;
  onReady?: (player: any) => void;
  onVideoEnd?: () => void;
  autoplayEnabled?: boolean;
  className?: string;
  poster?: string; // Added poster prop
}

export default function VideoPlayer({
  url,
  lessonId,
  videoId,
  onReady,
  onVideoEnd,
  autoplayEnabled = false,
  className = "",
  poster, // Destructure poster
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const user = userStore((state) => state.user);

  // Refs to hold latest values of props/state to avoid stale closures in callbacks
  const autoplayRef = useRef(autoplayEnabled);
  const onVideoEndRef = useRef(onVideoEnd);

  useEffect(() => {
    autoplayRef.current = autoplayEnabled;
    onVideoEndRef.current = onVideoEnd;
  }, [autoplayEnabled, onVideoEnd]);

  // Function to save progress
  const saveProgress = (player: any) => {
    if (!lessonId || !videoId || !user) return;

    const currentTime = player.currentTime();
    const duration = player.duration();

    if (
      duration !== undefined &&
      !isNaN(duration) &&
      currentTime !== undefined &&
      !isNaN(currentTime) &&
      duration > 0 &&
      currentTime >= 0 &&
      Math.abs(currentTime - lastSavedTimeRef.current) >= 5
    ) {
      lastSavedTimeRef.current = currentTime;

      api
        .post(API_ROUTES.VIEWING_HISTORY.UPDATE, {
          lessonId,
          videoId,
          currentTime,
          duration,
        })
        .then(() => {
          console.log("Progress saved:", currentTime, "of", duration);
        })
        .catch((err) => {
          console.error("Failed to save progress:", err);
        });
    }
  };

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");

      videoElement.oncontextmenu = (e) => {
        e.preventDefault();
        console.log("Right click disabled on video");
      };

      videoRef.current?.appendChild(videoElement);

      const player = (playerRef.current = videojs(
        videoElement,
        {
          controls: true,
          autoplay: autoplayEnabled,
          responsive: true,
          fluid: true,
          fill: true,
          playbackRates: [0.5, 1, 1.25, 1.5, 2],
          poster: poster || "", // Use dynamic poster if provided
          sources: [
            {
              src: url,
              type: "video/mp4",
            },
          ],
        },
        () => {
          console.log("Video.js player is ready");

          // Wait for metadata to load before trying to restore progress
          player.on("loadedmetadata", () => {
            if (lessonId && user) {
              api
                .get(API_ROUTES.VIEWING_HISTORY.GET_LESSON(lessonId))
                .then((res) => {
                  const history = res.data?.data;
                  const duration = player.duration();

                  if (
                    history &&
                    history.currentTime > 0 &&
                    duration !== undefined &&
                    !isNaN(duration) &&
                    duration > 0
                  ) {
                    player.currentTime(history.currentTime);
                    lastSavedTimeRef.current = history.currentTime;
                    console.log(
                      "Restored progress:",
                      history.currentTime,
                      "of",
                      duration
                    );
                  }
                })
                .catch((err) => {
                  console.error("Failed to load progress:", err);
                });
            }
          });

          // Track progress on timeupdate
          if (lessonId && videoId && user) {
            player.on("timeupdate", () => {
              if (progressTimerRef.current) {
                clearTimeout(progressTimerRef.current);
              }

              progressTimerRef.current = setTimeout(() => {
                saveProgress(player);
              }, 10000);
            });

            player.on("pause", () => {
              saveProgress(player);
            });

            player.on("seeked", () => {
              saveProgress(player);
            });

            // Handle video end - trigger autoplay if enabled
            player.on("ended", () => {
              saveProgress(player);

              // Small delay for smooth transition
              setTimeout(() => {
                if (autoplayRef.current && onVideoEndRef.current) {
                  onVideoEndRef.current();
                }
              }, 500);
            });
          }

          onReady && onReady(player);
        }
      ));
    } else {
      const player = playerRef.current;
      player.src({ src: url, type: "video/mp4" });
      if (poster) {
        player.poster(poster);
      }
      lastSavedTimeRef.current = 0;
    }

    return () => {
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }
      if (
        playerRef.current &&
        !playerRef.current.isDisposed() &&
        lessonId &&
        videoId &&
        user
      ) {
        saveProgress(playerRef.current);
      }
    };
  }, [url, lessonId, videoId, onReady, user, autoplayEnabled, onVideoEnd, poster]);

  // Save progress when page is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (
        playerRef.current &&
        !playerRef.current.isDisposed() &&
        lessonId &&
        videoId &&
        user
      ) {
        const currentTime = playerRef.current.currentTime();
        const duration = playerRef.current.duration();

        if (
          duration !== undefined &&
          !isNaN(duration) &&
          currentTime !== undefined &&
          !isNaN(currentTime) &&
          duration > 0 &&
          currentTime >= 0
        ) {
          const data = JSON.stringify({
            lessonId,
            videoId,
            currentTime,
            duration,
          });

          if (navigator.sendBeacon) {
            const blob = new Blob([data], { type: "application/json" });
            navigator.sendBeacon(API_ROUTES.VIEWING_HISTORY.UPDATE, blob);
          } else {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", API_ROUTES.VIEWING_HISTORY.UPDATE, false);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader(
              "Authorization",
              `Bearer ${localStorage.getItem("erpbugs-auth-jwt-token")}`
            );
            xhr.send(data);
          }
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [lessonId, videoId, user]);

  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        if (lessonId && videoId && user) {
          saveProgress(player);
        }
        player.dispose();
        playerRef.current = null;
      }
      if (progressTimerRef.current) {
        clearTimeout(progressTimerRef.current);
      }
    };
  }, [playerRef, lessonId, videoId, user]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={videoRef} className="w-full h-full" />
    </div>
  );
}
