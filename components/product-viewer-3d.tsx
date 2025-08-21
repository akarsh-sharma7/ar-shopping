"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Html, Cylinder, Sphere, RoundedBox } from "@react-three/drei"
import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Minus } from "lucide-react"

interface Product {
  id: number
  name: string
  brand: string
  price: string
  image: string
  category: string
  rating: number
  reviews: number
  personalityMatch: number
  skinToneMatch?: number
  description: string
  shades?: string[]
}

interface ProductViewer3DProps {
  product: Product
  onAddToCart: (product: Product, quantity: number, size: string) => void
  onClose: () => void
}

function LipstickModel({ color = "#dc2626" }: { color?: string }) {
  return (
    <group>
      {/* Lipstick case - more realistic proportions */}
      <Cylinder args={[0.4, 0.35, 3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} envMapIntensity={1.5} />
      </Cylinder>

      {/* Inner tube */}
      <Cylinder args={[0.32, 0.32, 2.8]} position={[0, 0.1, 0]}>
        <meshStandardMaterial color="#333" metalness={0.7} roughness={0.3} />
      </Cylinder>

      {/* Lipstick bullet - more realistic shape */}
      <group position={[0, 1.8, 0]}>
        <Cylinder args={[0.28, 0.22, 1.2]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color={color}
            metalness={0.2}
            roughness={0.4}
            emissive={color}
            emissiveIntensity={0.1}
          />
        </Cylinder>
        {/* Bullet tip */}
        <Sphere args={[0.22]} position={[0, 0.6, 0]} scale={[1, 0.8, 1]}>
          <meshStandardMaterial
            color={color}
            metalness={0.2}
            roughness={0.4}
            emissive={color}
            emissiveIntensity={0.1}
          />
        </Sphere>
      </group>

      {/* Brand embossing */}
      <RoundedBox args={[0.6, 0.2, 0.05]} position={[0, -0.5, 0.36]} radius={0.02}>
        <meshStandardMaterial color="#gold" metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* Decorative ring */}
      <Cylinder args={[0.42, 0.42, 0.1]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color="#gold" metalness={0.9} roughness={0.1} />
      </Cylinder>
    </group>
  )
}

function FoundationModel({ color = "#f4a460" }: { color?: string }) {
  return (
    <group>
      {/* Foundation bottle - glass material */}
      <Cylinder args={[0.5, 0.45, 3.5]} position={[0, 0, 0]}>
        <meshPhysicalMaterial
          color={color}
          transparent
          opacity={0.85}
          transmission={0.9}
          roughness={0.1}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Cylinder>

      {/* Foundation liquid inside */}
      <Cylinder args={[0.45, 0.4, 2.8]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color={color} opacity={0.9} transparent />
      </Cylinder>

      {/* Pump mechanism */}
      <group position={[0, 2, 0]}>
        {/* Pump base */}
        <Cylinder args={[0.4, 0.4, 0.3]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.2} />
        </Cylinder>

        {/* Pump tube */}
        <Cylinder args={[0.15, 0.15, 0.8]} position={[0, 0.4, 0]}>
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
        </Cylinder>

        {/* Pump head */}
        <RoundedBox args={[0.3, 0.2, 0.6]} position={[0, 0.9, 0]} radius={0.05}>
          <meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} />
        </RoundedBox>
      </group>

      {/* Label */}
      <RoundedBox args={[0.8, 0.6, 0.02]} position={[0, 0.5, 0.51]} radius={0.02}>
        <meshStandardMaterial color="#ffffff" />
      </RoundedBox>
    </group>
  )
}

function EyeshadowPaletteModel() {
  const colors = ["#8b4513", "#daa520", "#cd853f", "#f4a460", "#d2691e", "#bc8f8f", "#a0522d", "#deb887", "#f5deb3"]

  return (
    <group>
      {/* Palette case - bottom */}
      <RoundedBox args={[4, 0.3, 2.5]} position={[0, 0, 0]} radius={0.1}>
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
      </RoundedBox>

      {/* Palette case - top lid */}
      <RoundedBox args={[3.8, 0.2, 2.3]} position={[0, 1.2, 0]} rotation={[-Math.PI / 6, 0, 0]} radius={0.05}>
        <meshStandardMaterial color="#2a2a2a" metalness={0.4} roughness={0.6} />
      </RoundedBox>

      {/* Eyeshadow pans */}
      {colors.map((color, index) => (
        <group key={index}>
          {/* Pan container */}
          <Cylinder
            args={[0.35, 0.35, 0.15]}
            position={[-1.2 + (index % 3) * 1.2, 0.2, -0.6 + Math.floor(index / 3) * 0.6]}
          >
            <meshStandardMaterial color="#silver" metalness={0.8} roughness={0.2} />
          </Cylinder>

          {/* Eyeshadow powder */}
          <Cylinder
            args={[0.32, 0.32, 0.1]}
            position={[-1.2 + (index % 3) * 1.2, 0.25, -0.6 + Math.floor(index / 3) * 0.6]}
          >
            <meshStandardMaterial
              color={color}
              roughness={0.8}
              metalness={0.1}
              emissive={color}
              emissiveIntensity={0.05}
            />
          </Cylinder>
        </group>
      ))}

      {/* Mirror */}
      <RoundedBox args={[3.6, 0.05, 2.1]} position={[0, 1.1, 0.2]} rotation={[-Math.PI / 6, 0, 0]} radius={0.02}>
        <meshStandardMaterial color="#f8f8f8" metalness={0.95} roughness={0.05} envMapIntensity={2} />
      </RoundedBox>

      {/* Applicator brushes */}
      <Cylinder args={[0.05, 0.05, 1]} position={[-1.5, 0.6, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color="#8B4513" />
      </Cylinder>
      <Cylinder args={[0.05, 0.05, 1]} position={[1.5, 0.6, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <meshStandardMaterial color="#8B4513" />
      </Cylinder>
    </group>
  )
}

function MascaraModel() {
  return (
    <group>
      {/* Mascara tube - main body */}
      <Cylinder args={[0.3, 0.28, 4]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#000000"
          metalness={0.4}
          roughness={0.6}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </Cylinder>

      {/* Tube threading */}
      <Cylinder args={[0.32, 0.32, 0.2]} position={[0, 1.8, 0]}>
        <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
      </Cylinder>

      {/* Cap */}
      <group position={[0, 2.8, 0]}>
        <Cylinder args={[0.35, 0.32, 1.5]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#000000"
            metalness={0.5}
            roughness={0.5}
            clearcoat={0.9}
            clearcoatRoughness={0.1}
          />
        </Cylinder>

        {/* Cap top */}
        <Sphere args={[0.35]} position={[0, 0.75, 0]} scale={[1, 0.5, 1]}>
          <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.5} />
        </Sphere>
      </group>

      {/* Wand */}
      <Cylinder args={[0.03, 0.03, 3]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#silver" metalness={0.9} roughness={0.1} />
      </Cylinder>

      {/* Wand brush */}
      <Cylinder args={[0.08, 0.06, 0.8]} position={[0, 2.2, 0]}>
        <meshStandardMaterial color="#333" roughness={0.9} />
      </Cylinder>

      {/* Brand label */}
      <RoundedBox args={[0.5, 0.3, 0.02]} position={[0, -0.5, 0.31]} radius={0.01}>
        <meshStandardMaterial color="#gold" metalness={0.8} roughness={0.2} />
      </RoundedBox>
    </group>
  )
}

function BlushModel({ color = "#ff69b4" }: { color?: string }) {
  return (
    <group>
      {/* Compact case - bottom */}
      <Cylinder args={[1, 1, 0.4]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#2a2a2a"
          metalness={0.7}
          roughness={0.3}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </Cylinder>

      {/* Blush powder with texture */}
      <Cylinder args={[0.85, 0.85, 0.15]} position={[0, 0.15, 0]}>
        <meshStandardMaterial
          color={color}
          roughness={0.9}
          metalness={0.05}
          emissive={color}
          emissiveIntensity={0.03}
        />
      </Cylinder>

      {/* Powder pan (metal) */}
      <Cylinder args={[0.9, 0.9, 0.05]} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#silver" metalness={0.9} roughness={0.1} />
      </Cylinder>

      {/* Mirror lid */}
      <Cylinder args={[0.95, 0.95, 0.1]} position={[0, 0.8, 0]} rotation={[-Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
      </Cylinder>

      {/* Mirror surface */}
      <Cylinder args={[0.85, 0.85, 0.02]} position={[0, 0.82, 0.15]} rotation={[-Math.PI / 3, 0, 0]}>
        <meshStandardMaterial color="#f8f8f8" metalness={0.95} roughness={0.02} envMapIntensity={2} />
      </Cylinder>

      {/* Hinge */}
      <Cylinder args={[0.05, 0.05, 1]} position={[0, 0.4, 0.8]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#silver" metalness={0.9} roughness={0.1} />
      </Cylinder>

      {/* Applicator brush */}
      <group position={[0.6, 0.2, 0]}>
        <Cylinder args={[0.03, 0.03, 0.8]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#8B4513" />
        </Cylinder>
        <Sphere args={[0.08]} position={[0, 0.5, 0]} scale={[1, 0.6, 1]}>
          <meshStandardMaterial color="#DEB887" roughness={0.9} />
        </Sphere>
      </group>
    </group>
  )
}

function ProductModel({ product }: { product: Product }) {
  const getModelByCategory = () => {
    switch (product.category.toLowerCase()) {
      case "lips":
        if (product.name.toLowerCase().includes("lipstick")) {
          return <LipstickModel color="#dc2626" />
        }
        return <LipstickModel color="#ec4899" />
      case "face":
        return <FoundationModel />
      case "eyes":
        if (product.name.toLowerCase().includes("palette")) {
          return <EyeshadowPaletteModel />
        }
        return <MascaraModel />
      case "cheeks":
        return <BlushModel />
      default:
        return <LipstickModel />
    }
  }

  return <group>{getModelByCategory()}</group>
}

function Scene({ product }: { product: Product }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 5, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.6} />
      <spotLight position={[0, 10, 0]} intensity={0.5} angle={0.3} penumbra={1} />

      <ProductModel product={product} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={12}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
      <Environment preset="city" background={false} />
    </>
  )
}

export default function ProductViewer3D({ product, onAddToCart, onClose }: ProductViewer3DProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("Standard")

  const sizes = ["Travel", "Standard", "Full", "Jumbo"]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardContent className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* 3D Viewer */}
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <Suspense
                  fallback={
                    <Html center>
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading 3D model...</p>
                      </div>
                    </Html>
                  }
                >
                  <Scene product={product} />
                </Suspense>
              </Canvas>

              {/* 3D Controls Info */}
              <div className="absolute bottom-4 left-4 bg-black/70 text-white p-2 rounded text-xs">
                <p>🖱️ Drag to rotate • 🔍 Scroll to zoom • ⌨️ Shift+drag to pan</p>
              </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {product.brand}
                    </Badge>
                    <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                    <p className="text-3xl font-bold text-pink-600 mb-4">{product.price}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    ✕
                  </Button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 font-medium">{product.rating}</span>
                    <span className="text-gray-500 ml-1">({product.reviews} reviews)</span>
                  </div>
                  <Badge variant="outline">{product.personalityMatch}% personality match</Badge>
                  {product.skinToneMatch && (
                    <Badge variant="outline" className="bg-green-50">
                      {product.skinToneMatch}% skin tone match
                    </Badge>
                  )}
                </div>

                <p className="text-gray-600 mb-6">{product.description}</p>

                {/* Size Selection */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Size</h3>
                  <div className="flex gap-2">
                    {sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Quantity</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  onClick={() => onAddToCart(product, quantity, selectedSize)}
                >
                  Add to Cart - {product.price}
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Try with AR
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
