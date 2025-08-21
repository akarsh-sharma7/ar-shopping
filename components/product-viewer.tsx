"use client"

import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Html, useGLTF } from "@react-three/drei"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, RotateCcw, ZoomIn } from "lucide-react"
import type { Product } from "@/app/page"

interface ProductViewerProps {
  product: Product
  onAddToCart: (product: Product, size: string) => void
}

function Product3D({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath)

  return <primitive object={scene} scale={2} position={[0, -1, 0]} />
}

export function ProductViewer({ product, onAddToCart }: ProductViewerProps) {
  const [selectedSize, setSelectedSize] = useState(product.size[0])
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([0, 0, 5])

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize)
  }

  const resetCamera = () => {
    setCameraPosition([0, 0, 5])
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 3D Viewer */}
      <Card className="h-[600px]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>3D Product View</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={resetCamera}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Badge variant="secondary">
                <ZoomIn className="h-3 w-3 mr-1" />
                Interactive
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[500px]">
          <Canvas camera={{ position: cameraPosition, fov: 50 }}>
            <Suspense
              fallback={
                <Html center>
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading 3D model...</p>
                  </div>
                </Html>
              }
            >
              <Product3D modelPath={product.model3d} />
              <Environment preset="studio" />
              <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={2} maxDistance={10} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
            </Suspense>
          </Canvas>
        </CardContent>
      </Card>

      {/* Product Details */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              <Badge variant="secondary" className="ml-2">
                {product.personalityMatch}% match
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{product.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <Badge variant="outline" className="capitalize">
                  {product.category}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
                <Badge variant="outline" className="capitalize">
                  {product.color}
                </Badge>
              </div>
            </div>

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
            <CardTitle className="text-lg">3D Viewer Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Rotate:</strong> Click and drag
              </p>
              <p>
                <strong>Zoom:</strong> Mouse wheel or pinch
              </p>
              <p>
                <strong>Pan:</strong> Right-click and drag
              </p>
              <p>
                <strong>Reset:</strong> Click the reset button
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
