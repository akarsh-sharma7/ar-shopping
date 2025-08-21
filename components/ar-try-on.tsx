"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Camera, ShoppingCart, Smartphone } from "lucide-react"
import type { Product } from "@/app/page"
import { EnhancedCamera } from "./enhanced-camera"

interface ARTryOnProps {
  product: Product
  onAddToCart: (product: Product, size: string) => void
}

export function ARTryOn({ product, onAddToCart }: ARTryOnProps) {
  const [selectedSize, setSelectedSize] = useState(product.size[0])
  const [isARActive, setIsARActive] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraStream])

  const startAR = async () => {
    try {
      console.log("[v0] Starting AR experience")

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported on this device")
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      console.log("[v0] AR camera stream obtained")
      setCameraStream(stream)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          console.log("[v0] AR video ready to play")
        }
      }
      setIsARActive(true)
    } catch (error) {
      console.error("[v0] Error accessing camera:", error)
      alert("Camera access denied or not available. Please check your browser permissions and try again.")
      // Fallback to demo mode
      setIsARActive(true)
    }
  }

  const stopAR = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setIsARActive(false)
  }

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize)
  }

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const ctx = canvas.getContext("2d")

      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)

        // Create download link
        const link = document.createElement("a")
        link.download = `ar-tryOn-${product.name}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* AR View */}
      <Card className="h-[600px]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>AR Try-On</CardTitle>
            <div className="flex space-x-2">
              {!isARActive ? (
                <Button onClick={startAR} size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Start AR
                </Button>
              ) : (
                <>
                  <Button onClick={takeSnapshot} variant="outline" size="sm">
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button onClick={stopAR} variant="outline" size="sm">
                    Stop
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[500px] relative">
          {!isARActive ? (
            <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Try Before You Buy</h3>
                  <p className="text-gray-600 mt-1">Use enhanced AR to see how this product looks on you</p>
                </div>
                <Button onClick={startAR} className="mt-4">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Enhanced AR Experience
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <EnhancedCamera
                onCapture={(imageData) => {
                  // Handle captured image for AR analysis
                  console.log("[v0] AR image captured:", imageData.slice(0, 50))
                }}
                onStreamReady={(stream) => {
                  console.log("[v0] AR camera stream ready")
                  setCameraStream(stream)
                }}
                showControls={false}
                autoFocus={true}
              />

              {/* AR Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  Enhanced AR Active
                </div>

                {/* Simulated AR product overlay with better positioning */}
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-8 h-8 rounded border-2 border-white shadow-sm"
                        style={{
                          backgroundColor:
                            product.category === "lips"
                              ? "#E11D48"
                              : product.category === "eyes"
                                ? "#7C3AED"
                                : product.category === "face"
                                  ? "#F59E0B"
                                  : "#EC4899",
                        }}
                      ></div>
                      <div>
                        <p className="font-semibold text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">Virtual overlay active • HD quality</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>

      {/* Product Info & Controls */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              <Badge variant="secondary">AR Compatible</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{product.description}</p>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {product.size.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddToCart} className="w-full" size="lg">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart - ${product.price}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AR Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Virtual makeup try-on</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Color matching on skin tone</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Shade comparison</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Before/after comparison</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Use AR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Click "Start AR" to activate your camera</p>
              <p>2. Position your face in good lighting</p>
              <p>3. The makeup will appear applied to your face</p>
              <p>4. Try different shades and compare looks</p>
              <p>5. Take a snapshot to save your virtual makeover</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
