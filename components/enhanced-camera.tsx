"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Camera, Video, VideoOff, RotateCcw, Settings, Sun, Moon } from "lucide-react"

interface CameraSettings {
  resolution: string
  facingMode: "user" | "environment"
  brightness: number
  contrast: number
  saturation: number
}

interface EnhancedCameraProps {
  onCapture?: (imageData: string) => void
  onStreamReady?: (stream: MediaStream) => void
  showControls?: boolean
  autoFocus?: boolean
}

export function EnhancedCamera({
  onCapture,
  onStreamReady,
  showControls = true,
  autoFocus = true,
}: EnhancedCameraProps) {
  const [isActive, setIsActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [settings, setSettings] = useState<CameraSettings>({
    resolution: "640x480",
    facingMode: "user",
    brightness: 50,
    contrast: 50,
    saturation: 50,
  })
  const [error, setError] = useState<string | null>(null)
  const [isFlashOn, setIsFlashOn] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      console.log("[v0] Starting camera with settings:", settings)

      const permissions = await navigator.permissions.query({ name: "camera" as PermissionName })
      console.log("[v0] Camera permission status:", permissions.state)

      const [width, height] = settings.resolution.split("x").map(Number)

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: settings.facingMode,
          width: { ideal: width },
          height: { ideal: height },
          frameRate: { ideal: 30 },
          // Advanced camera settings
          ...(autoFocus && {
            focusMode: "continuous",
            exposureMode: "continuous",
            whiteBalanceMode: "continuous",
          }),
        },
        audio: false,
      }

      console.log("[v0] Requesting camera with constraints:", constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("[v0] Camera stream obtained:", stream.getTracks().length, "tracks")

      setCameraStream(stream)

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        videoRef.current.onloadedmetadata = () => {
          console.log("[v0] Video metadata loaded, applying filters")
          const videoElement = videoRef.current!
          videoElement.style.filter = `
            brightness(${settings.brightness}%) 
            contrast(${settings.contrast}%) 
            saturate(${settings.saturation}%)
          `
        }
      }

      setIsActive(true)
      onStreamReady?.(stream)

      // Setup media recorder for video recording
      if (stream && MediaRecorder.isTypeSupported("video/webm")) {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm",
        })

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: "video/webm" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `ar-recording-${Date.now()}.webm`
          a.click()
          recordedChunksRef.current = []
        }

        mediaRecorderRef.current = mediaRecorder
      }
    } catch (err: any) {
      console.error("[v0] Error starting camera:", err)
      setError(err.message || "Failed to access camera. Please check permissions.")
      setIsActive(false)
    }
  }, [settings, selectedDeviceId, autoFocus, onStreamReady])

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop()
      })
      setCameraStream(null)
    }

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }

    setIsActive(false)
  }, [cameraStream, isRecording])

  // Capture photo with enhanced quality
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    // Set high-quality canvas settings
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Apply image enhancements
    ctx.filter = `
      brightness(${settings.brightness}%) 
      contrast(${settings.contrast}%) 
      saturate(${settings.saturation}%)
    `

    ctx.drawImage(video, 0, 0)

    // Get high-quality image data
    const imageData = canvas.toDataURL("image/png", 1.0)
    onCapture?.(imageData)

    // Flash effect
    if (isFlashOn) {
      const flashDiv = document.createElement("div")
      flashDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 9999;
        pointer-events: none;
        opacity: 0.8;
      `
      document.body.appendChild(flashDiv)
      setTimeout(() => document.body.removeChild(flashDiv), 100)
    }
  }, [settings, onCapture, isFlashOn])

  // Start/stop video recording
  const toggleRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return

    if (isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    } else {
      recordedChunksRef.current = []
      mediaRecorderRef.current.start()
      setIsRecording(true)
    }
  }, [isRecording])

  // Switch camera (front/back)
  const switchCamera = useCallback(() => {
    const newFacingMode = settings.facingMode === "user" ? "environment" : "user"
    setSettings((prev) => ({ ...prev, facingMode: newFacingMode }))

    if (isActive) {
      stopCamera()
      setTimeout(() => {
        setSettings((prev) => ({ ...prev, facingMode: newFacingMode }))
      }, 100)
    }
  }, [settings.facingMode, isActive, stopCamera])

  // Update camera settings
  const updateSettings = useCallback(
    (newSettings: Partial<CameraSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }))

      if (isActive && videoRef.current) {
        const videoElement = videoRef.current
        videoElement.style.filter = `
        brightness(${newSettings.brightness || settings.brightness}%) 
        contrast(${newSettings.contrast || settings.contrast}%) 
        saturate(${newSettings.saturation || settings.saturation}%)
      `
      }
    },
    [isActive, settings],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // Get available camera devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        setAvailableDevices(videoDevices)
        if (videoDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoDevices[0].deviceId)
        }
      } catch (err) {
        console.error("Error getting devices:", err)
      }
    }

    getDevices()
  }, [selectedDeviceId])

  useEffect(() => {
    if (autoFocus && !isActive) {
      startCamera()
    }
  }, [autoFocus, isActive])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Enhanced Camera</span>
            {isActive && (
              <Badge variant="secondary" className="animate-pulse">
                Live
              </Badge>
            )}
          </CardTitle>

          <div className="flex space-x-2">
            {isActive && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFlashOn(!isFlashOn)}
                  className={isFlashOn ? "bg-yellow-100" : ""}
                >
                  {isFlashOn ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                <Button variant="outline" size="sm" onClick={switchCamera}>
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button variant="outline" size="sm" onClick={capturePhoto}>
                  <Camera className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleRecording}
                  className={isRecording ? "bg-red-100 text-red-600" : ""}
                >
                  {isRecording ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </Button>
              </>
            )}

            <Button
              onClick={isActive ? stopCamera : startCamera}
              size="sm"
              variant={isActive ? "destructive" : "default"}
            >
              {isActive ? "Stop" : "Start"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Camera View */}
        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {isActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("[v0] Video element error:", e)
                  setError("Video playback failed")
                }}
                onCanPlay={() => {
                  console.log("[v0] Video can play")
                }}
              />

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">REC</span>
                </div>
              )}

              {/* Camera info overlay */}
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
                {settings.resolution} • {settings.facingMode === "user" ? "Front" : "Back"}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <Camera className="h-16 w-16 mx-auto text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Camera Ready</h3>
                  <p className="text-gray-600">Click start to begin camera session</p>
                  {error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-600 text-sm">{error}</p>
                      <p className="text-red-500 text-xs mt-1">Make sure to allow camera access when prompted</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Camera Controls */}
        {showControls && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Device Selection */}
              {availableDevices.length > 1 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Camera Device</label>
                  <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDevices.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Resolution Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Resolution</label>
                <Select value={settings.resolution} onValueChange={(value) => updateSettings({ resolution: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="640x480">640x480 (SD)</SelectItem>
                    <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                    <SelectItem value="1920x1080">1920x1080 (Full HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image Enhancement Controls */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Image Enhancement</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Brightness: {settings.brightness}%</label>
                  <Slider
                    value={[settings.brightness]}
                    onValueChange={([value]) => updateSettings({ brightness: value })}
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Contrast: {settings.contrast}%</label>
                  <Slider
                    value={[settings.contrast]}
                    onValueChange={([value]) => updateSettings({ contrast: value })}
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Saturation: {settings.saturation}%</label>
                  <Slider
                    value={[settings.saturation]}
                    onValueChange={([value]) => updateSettings({ saturation: value })}
                    min={0}
                    max={200}
                    step={5}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  )
}
