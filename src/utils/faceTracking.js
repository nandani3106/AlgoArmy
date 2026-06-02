import { FilesetResolver, FaceDetector } from "@mediapipe/tasks-vision";

let faceDetectorInstance = null;
let isLoadingPromise = null;

export const loadTrackingScripts = () => {
  if (faceDetectorInstance) {
    return Promise.resolve(faceDetectorInstance);
  }
  if (isLoadingPromise) {
    return isLoadingPromise;
  }

  isLoadingPromise = (async () => {
    // Try multiple CDNs for WASM to ensure maximum compatibility
    const wasmCDNs = [
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
      "https://unpkg.com/@mediapipe/tasks-vision@0.10.35/wasm"
    ];

    let vision = null;
    let loadError = null;

    for (const wasmUrl of wasmCDNs) {
      try {
        console.log(`Attempting to load FilesetResolver from: ${wasmUrl}`);
        vision = await FilesetResolver.forVisionTasks(wasmUrl);
        if (vision) break;
      } catch (err) {
        console.warn(`FilesetResolver failed to load from ${wasmUrl}:`, err);
        loadError = err;
      }
    }

    if (!vision) {
      throw new Error(`Failed to load MediaPipe WASM from all sources. Last error: ${loadError?.message}`);
    }

    // Try GPU delegate first, fallback to CPU delegate if GPU initialization fails
    const delegates = ["GPU", "CPU"];
    let creationError = null;

    for (const delegate of delegates) {
      try {
        console.log(`Attempting to create FaceDetector with delegate: ${delegate}`);
        faceDetectorInstance = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/models/blaze_face_short_range.task",
            delegate: delegate
          },
          runningMode: "VIDEO"
        });
        if (faceDetectorInstance) {
          console.log("Model loaded successfully from /models/blaze_face_short_range.task");
          console.log(`Face detector initialized successfully with delegate: ${delegate}`);
          break;
        }
      } catch (err) {
        console.warn(`FaceDetector creation failed with delegate ${delegate}:`, err);
        creationError = err;
      }
    }

    if (!faceDetectorInstance) {
      throw new Error(`Failed to create FaceDetector instance. Last error: ${creationError?.message}`);
    }

    return faceDetectorInstance;
  })();

  return isLoadingPromise;
};

export const startFaceTracking = (videoElement, onFacesDetected) => {
  if (!faceDetectorInstance || !videoElement) return null;

  let isActive = true;
  let lastVideoTime = -1;
  let timerId = null;

  const detectFrame = () => {
    if (!isActive) return;

    try {
      if (videoElement.readyState >= 2 && !videoElement.paused && !videoElement.ended) {
        const currentTime = videoElement.currentTime;
        if (currentTime !== lastVideoTime) {
          lastVideoTime = currentTime;
          const result = faceDetectorInstance.detectForVideo(videoElement, performance.now());
          const detectedCount = result?.detections?.length || 0;
          console.log(`Faces detected count: ${detectedCount}`);
          onFacesDetected(result.detections || []);
        }
      }
    } catch (err) {
      console.error("Error detecting face frame:", err);
    }

    // Run at ~10 frames per second to ensure high accuracy while keeping CPU usage minimal
    timerId = setTimeout(detectFrame, 100);
  };

  detectFrame();

  return {
    stop: () => {
      isActive = false;
      if (timerId) {
        clearTimeout(timerId);
      }
    }
  };
};
