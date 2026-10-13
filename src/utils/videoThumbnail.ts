// Captures a frame from a video file as a JPEG File, entirely in the
// browser (an off-DOM <video> + <canvas>) — no server-side processing and
// no new dependency. Used to auto-generate a thumbnail for video uploads,
// with the result always replaceable by a manually chosen image.
export function captureVideoThumbnail(file: File, atSeconds = 1): Promise<File> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    video.addEventListener("error", () => {
      cleanup();
      reject(new Error("Could not read video file to generate a thumbnail"));
    });

    video.addEventListener("loadedmetadata", () => {
      // Clamp to the video's actual length so a short clip doesn't seek
      // past its end.
      const seekTo = Math.min(atSeconds, Math.max(video.duration - 0.1, 0));
      video.currentTime = seekTo;
    });

    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        cleanup();
        reject(new Error("Canvas is not supported in this browser"));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          cleanup();
          if (!blob) {
            reject(new Error("Could not capture a thumbnail from this video"));
            return;
          }
          const name = `${file.name.replace(/\.[^.]+$/, "")}-thumb.jpg`;
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.85,
      );
    });
  });
}
