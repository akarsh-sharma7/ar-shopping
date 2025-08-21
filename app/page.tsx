"use client"

import { useState, useEffect } from "react"
import { ProductViewer } from "@/components/product-viewer"
import { ProductCatalog } from "@/components/product-catalog"
import { ARTryOn } from "@/components/ar-try-on"
import { PersonalizationPanel } from "@/components/personalization-panel"
import { ShoppingCart } from "@/components/shopping-cart"
import { SkinToneAnalyzer, type SkinToneAnalysis } from "@/components/skin-tone-analyzer"
import ProductViewer3D from "@/components/product-viewer-3d"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Sparkles, Scan, User } from "lucide-react"
import Link from "next/link"
import { DatabaseService } from "@/lib/database-service"
import { supabase } from "@/lib/supabase/client"

export interface Product {
  id: string
  name: string
  price: number
  category: string
  color: string
  size: string[]
  model3d: string
  image: string
  description: string
  personalityMatch: number
  skinToneMatch?: number
  brand: string
  rating: number
  reviews: number
}

export interface CartItem extends Product {
  quantity: number
  selectedSize: string
}

export interface UserPreferences {
  style: string
  colors: string[]
  size: string
  budget: number
  occasions: string[]
  skinTone?: SkinToneAnalysis
}

export default function ARShoppingApp() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [show3DViewer, setShow3DViewer] = useState(false)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    style: "natural",
    colors: ["pink", "brown"],
    size: "standard",
    budget: 16600,
    occasions: ["daily", "evening"],
  })
  const [showCart, setShowCart] = useState(false)
  const [showSkinAnalyzer, setShowSkinAnalyzer] = useState(false)
  const [activeTab, setActiveTab] = useState("catalog")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setCurrentUser(user)

        if (user) {
          const preferences = await DatabaseService.loadUserPreferences(user.id)
          if (preferences) {
            setUserPreferences(preferences)
          }

          const cartData = await DatabaseService.loadUserCart(user.id)
          setCartItems(cartData)
        }
      } catch (error) {
        console.error("[v0] Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setCurrentUser(session?.user || null)

      if (session?.user) {
        const preferences = await DatabaseService.loadUserPreferences(session.user.id)
        if (preferences) {
          setUserPreferences(preferences)
        }

        const cartData = await DatabaseService.loadUserCart(session.user.id)
        setCartItems(cartData)
      } else {
        setUserPreferences({
          style: "natural",
          colors: ["pink", "brown"],
          size: "standard",
          budget: 16600,
          occasions: ["daily", "evening"],
        })
        setCartItems([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (currentUser && !isLoading) {
      DatabaseService.saveUserPreferences(currentUser.id, userPreferences)
    }
  }, [userPreferences, currentUser, isLoading])

  const products: Product[] = [
    // Maybelline New York
    {
      id: "1",
      name: "SuperStay Matte Ink Liquid Lipstick",
      price: 996,
      category: "lips",
      color: "red",
      size: ["5ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/maybelline-superstay-red.png",
      description: "Up to 16-hour wear liquid matte lipstick",
      personalityMatch: 95,
      brand: "Maybelline New York",
      rating: 4.5,
      reviews: 2847,
    },
    {
      id: "2",
      name: "Fit Me Matte + Poreless Foundation",
      price: 664,
      category: "face",
      color: "beige",
      size: ["30ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/maybelline-fitme-foundation.png",
      description: "Natural coverage foundation for normal to oily skin",
      personalityMatch: 92,
      brand: "Maybelline New York",
      rating: 4.3,
      reviews: 5621,
    },
    {
      id: "3",
      name: "The Falsies Lash Lift Mascara",
      price: 830,
      category: "eyes",
      color: "black",
      size: ["9.6ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/maybelline-falsies-mascara.png",
      description: "Lifts and lengthens lashes for a false lash effect",
      personalityMatch: 89,
      brand: "Maybelline New York",
      rating: 4.4,
      reviews: 3456,
    },
    {
      id: "4",
      name: "Cheek Heat Gel-Based Blush",
      price: 747,
      category: "cheeks",
      color: "pink",
      size: ["4.5ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/maybelline-cheek-heat.png",
      description: "Buildable gel blush for a natural flush",
      personalityMatch: 87,
      brand: "Maybelline New York",
      rating: 4.2,
      reviews: 1892,
    },
    {
      id: "5",
      name: "Tattoo Brow 36HR Eyebrow Pencil",
      price: 913,
      category: "eyes",
      color: "brown",
      size: ["0.2g"],
      model3d: "/assets/3d/duck.glb",
      image: "/maybelline-tattoo-brow.png",
      description: "Long-lasting eyebrow pencil with spoolie",
      personalityMatch: 85,
      brand: "Maybelline New York",
      rating: 4.6,
      reviews: 2134,
    },

    // L'Oréal Paris
    {
      id: "6",
      name: "Rouge Signature Matte Lip Stain",
      price: 1162,
      category: "lips",
      color: "berry",
      size: ["7ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/loreal-rouge-signature.png",
      description: "Ultra-lightweight matte liquid lipstick",
      personalityMatch: 93,
      brand: "L'Oréal Paris",
      rating: 4.4,
      reviews: 1967,
    },
    {
      id: "7",
      name: "True Match Foundation",
      price: 1328,
      category: "face",
      color: "nude",
      size: ["30ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/loreal-true-match.png",
      description: "Perfect match foundation with SPF 17",
      personalityMatch: 91,
      brand: "L'Oréal Paris",
      rating: 4.5,
      reviews: 4523,
    },
    {
      id: "8",
      name: "Voluminous Lash Paradise Mascara",
      price: 1079,
      category: "eyes",
      color: "black",
      size: ["7.6ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/loreal-lash-paradise.png",
      description: "Volumizing and lengthening mascara",
      personalityMatch: 88,
      brand: "L'Oréal Paris",
      rating: 4.3,
      reviews: 3789,
    },
    {
      id: "9",
      name: "Infallible 24HR Eye Shadow",
      price: 996,
      category: "eyes",
      color: "gold",
      size: ["3.5g"],
      model3d: "/assets/3d/duck.glb",
      image: "/loreal-infallible-eyeshadow.png",
      description: "Waterproof cream eyeshadow",
      personalityMatch: 86,
      brand: "L'Oréal Paris",
      rating: 4.2,
      reviews: 2456,
    },

    // MAC Cosmetics
    {
      id: "10",
      name: "Ruby Woo Lipstick",
      price: 2075,
      category: "lips",
      color: "red",
      size: ["3g"],
      model3d: "/assets/3d/duck.glb",
      image: "/mac-ruby-woo.png",
      description: "Iconic matte red lipstick",
      personalityMatch: 96,
      brand: "MAC Cosmetics",
      rating: 4.7,
      reviews: 8934,
    },
    {
      id: "11",
      name: "Studio Fix Fluid Foundation",
      price: 2905,
      category: "face",
      color: "beige",
      size: ["30ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/mac-studio-fix.png",
      description: "Medium to full coverage foundation",
      personalityMatch: 94,
      brand: "MAC Cosmetics",
      rating: 4.6,
      reviews: 5672,
    },
    {
      id: "12",
      name: "In Extreme Dimension Mascara",
      price: 2324,
      category: "eyes",
      color: "black",
      size: ["13ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/mac-extreme-dimension.png",
      description: "3D volume and curl mascara",
      personalityMatch: 90,
      brand: "MAC Cosmetics",
      rating: 4.4,
      reviews: 3421,
    },
    {
      id: "13",
      name: "Extra Dimension Blush",
      price: 2490,
      category: "cheeks",
      color: "coral",
      size: ["4g"],
      model3d: "/assets/3d/duck.glb",
      image: "/mac-extra-dimension-blush.png",
      description: "Luminous powder blush",
      personalityMatch: 88,
      brand: "MAC Cosmetics",
      rating: 4.5,
      reviews: 2789,
    },

    // Urban Decay
    {
      id: "14",
      name: "All Nighter Setting Spray",
      price: 2656,
      category: "face",
      color: "clear",
      size: ["118ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/urban-decay-all-nighter.png",
      description: "16-hour makeup setting spray",
      personalityMatch: 85,
      brand: "Urban Decay",
      rating: 4.6,
      reviews: 4567,
    },
    {
      id: "15",
      name: "Naked3 Eyeshadow Palette",
      price: 4482,
      category: "eyes",
      color: "pink",
      size: ["15.6g"],
      model3d: "/assets/3d/duck.glb",
      image: "/urban-decay-naked3.png",
      description: "12 rose-hued neutral eyeshadows",
      personalityMatch: 92,
      brand: "Urban Decay",
      rating: 4.8,
      reviews: 6789,
    },
    {
      id: "16",
      name: "Vice Lipstick",
      price: 1826,
      category: "lips",
      color: "purple",
      size: ["3.4g"],
      model3d: "/assets/3d/duck.glb",
      image: "/urban-decay-vice-lipstick.png",
      description: "Creamy, pigmented lipstick",
      personalityMatch: 87,
      brand: "Urban Decay",
      rating: 4.3,
      reviews: 2345,
    },

    // NARS
    {
      id: "17",
      name: "Orgasm Blush",
      price: 3154,
      category: "cheeks",
      color: "coral",
      size: ["4.8g"],
      model3d: "/assets/3d/duck.glb",
      image: "/nars-orgasm-blush.png",
      description: "Iconic peachy pink blush with golden undertones",
      personalityMatch: 94,
      brand: "NARS",
      rating: 4.7,
      reviews: 7234,
    },
    {
      id: "18",
      name: "Sheer Glow Foundation",
      price: 3901,
      category: "face",
      color: "nude",
      size: ["30ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/nars-sheer-glow.png",
      description: "Natural radiant finish foundation",
      personalityMatch: 91,
      brand: "NARS",
      rating: 4.5,
      reviews: 3456,
    },
    {
      id: "19",
      name: "Velvet Matte Lip Pencil",
      price: 2241,
      category: "lips",
      color: "red",
      size: ["2.4g"],
      model3d: "/assets/3d/duck.glb",
      image: "/nars-velvet-matte.png",
      description: "Precision matte lip color",
      personalityMatch: 89,
      brand: "NARS",
      rating: 4.4,
      reviews: 2987,
    },

    // Fenty Beauty
    {
      id: "20",
      name: "Pro Filt'r Foundation",
      price: 2988,
      category: "face",
      color: "brown",
      size: ["32ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/fenty-pro-filtr.png",
      description: "Soft matte longwear foundation",
      personalityMatch: 93,
      brand: "Fenty Beauty",
      rating: 4.6,
      reviews: 5432,
    },
    {
      id: "21",
      name: "Stunna Lip Paint",
      price: 2075,
      category: "lips",
      color: "red",
      size: ["4ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/fenty-stunna-lip.png",
      description: "Longwear fluid lip color",
      personalityMatch: 95,
      brand: "Fenty Beauty",
      rating: 4.5,
      reviews: 4321,
    },
    {
      id: "22",
      name: "Killawatt Freestyle Highlighter",
      price: 2988,
      category: "face",
      color: "gold",
      size: ["8g"],
      model3d: "/assets/3d/duck.glb",
      image: "/fenty-killawatt.png",
      description: "Hybrid powder highlighter",
      personalityMatch: 90,
      brand: "Fenty Beauty",
      rating: 4.7,
      reviews: 3876,
    },

    // Charlotte Tilbury
    {
      id: "23",
      name: "Pillow Talk Lipstick",
      price: 2822,
      category: "lips",
      color: "nude",
      size: ["3.5g"],
      model3d: "/assets/3d/duck.glb",
      image: "/charlotte-pillow-talk.png",
      description: "Universally flattering nude pink",
      personalityMatch: 96,
      brand: "Charlotte Tilbury",
      rating: 4.8,
      reviews: 6543,
    },
    {
      id: "24",
      name: "Magic Foundation",
      price: 3652,
      category: "face",
      color: "beige",
      size: ["30ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/charlotte-magic-foundation.png",
      description: "Medium coverage foundation with SPF 15",
      personalityMatch: 92,
      brand: "Charlotte Tilbury",
      rating: 4.6,
      reviews: 4567,
    },
    {
      id: "25",
      name: "Cheek to Chic Blush",
      price: 3320,
      category: "cheeks",
      color: "pink",
      size: ["8g"],
      model3d: "/assets/3d/duck.glb",
      image: "/charlotte-cheek-to-chic.png",
      description: "Two-tone blush for sculpting and highlighting",
      personalityMatch: 88,
      brand: "Charlotte Tilbury",
      rating: 4.5,
      reviews: 2345,
    },

    // Rare Beauty
    {
      id: "26",
      name: "Soft Pinch Liquid Blush",
      price: 1660,
      category: "cheeks",
      color: "pink",
      size: ["15ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/rare-beauty-soft-pinch.png",
      description: "Weightless, long-lasting liquid blush",
      personalityMatch: 91,
      brand: "Rare Beauty",
      rating: 4.7,
      reviews: 3456,
    },
    {
      id: "27",
      name: "Liquid Touch Weightless Foundation",
      price: 2407,
      category: "face",
      color: "nude",
      size: ["30ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/rare-beauty-foundation.png",
      description: "Buildable medium coverage foundation",
      personalityMatch: 89,
      brand: "Rare Beauty",
      rating: 4.4,
      reviews: 2789,
    },
    {
      id: "28",
      name: "Soft Matte Lip Cream",
      price: 1328,
      category: "lips",
      color: "berry",
      size: ["5ml"],
      model3d: "/assets/3d/duck.glb",
      image: "/rare-beauty-lip-cream.png",
      description: "Comfortable matte liquid lipstick",
      personalityMatch: 87,
      brand: "Rare Beauty",
      rating: 4.3,
      reviews: 1987,
    },
  ]

  const addToCart = async (product: Product, selectedSize: string) => {
    const existingItem = cartItems.find((item) => item.id === product.id && item.selectedSize === selectedSize)

    let updatedItems: CartItem[]
    if (existingItem) {
      updatedItems = cartItems.map((item) =>
        item.id === product.id && item.selectedSize === selectedSize ? { ...item, quantity: item.quantity + 1 } : item,
      )
    } else {
      updatedItems = [...cartItems, { ...product, quantity: 1, selectedSize }]
    }

    setCartItems(updatedItems)

    if (currentUser) {
      const cartItem = updatedItems.find((item) => item.id === product.id && item.selectedSize === selectedSize)
      if (cartItem) {
        await DatabaseService.saveCartItem(currentUser.id, cartItem)
      }
    }
  }

  const addToCartWithQuantity = async (product: Product, quantity: number, selectedSize: string) => {
    const existingItem = cartItems.find((item) => item.id === product.id && item.selectedSize === selectedSize)

    let updatedItems: CartItem[]
    if (existingItem) {
      updatedItems = cartItems.map((item) =>
        item.id === product.id && item.selectedSize === selectedSize
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      )
    } else {
      updatedItems = [...cartItems, { ...product, quantity, selectedSize }]
    }

    setCartItems(updatedItems)

    if (currentUser) {
      const cartItem = updatedItems.find((item) => item.id === product.id && item.selectedSize === selectedSize)
      if (cartItem) {
        await DatabaseService.saveCartItem(currentUser.id, cartItem)
      }
    }
  }

  const handleProductSelect = async (product: Product) => {
    setSelectedProduct(product)
    setShow3DViewer(true)

    if (currentUser) {
      await DatabaseService.logARSession(currentUser.id, product.id, {
        action: "product_selected",
        timestamp: new Date().toISOString(),
        product_name: product.name,
        product_brand: product.brand,
      })
    }
  }

  const removeFromCart = async (productId: string, selectedSize: string) => {
    setCartItems(cartItems.filter((item) => !(item.id === productId && item.selectedSize === selectedSize)))

    if (currentUser) {
      await DatabaseService.removeCartItem(currentUser.id, productId, selectedSize)
    }
  }

  const updateQuantity = async (productId: string, selectedSize: string, quantity: number) => {
    if (quantity === 0) {
      await removeFromCart(productId, selectedSize)
    } else {
      const updatedItems = cartItems.map((item) =>
        item.id === productId && item.selectedSize === selectedSize ? { ...item, quantity } : item,
      )
      setCartItems(updatedItems)

      if (currentUser) {
        const cartItem = updatedItems.find((item) => item.id === productId && item.selectedSize === selectedSize)
        if (cartItem) {
          await DatabaseService.saveCartItem(currentUser.id, cartItem)
        }
      }
    }
  }

  const calculateSkinToneMatch = (product: Product, skinTone: SkinToneAnalysis): number => {
    const { bestColors, avoidColors } = skinTone.recommendations

    if (bestColors.includes(product.color)) {
      return 95
    } else if (avoidColors.includes(product.color)) {
      return 30
    } else {
      return 70
    }
  }

  const getPersonalizedProducts = () => {
    let filteredProducts = products.filter((product) => {
      const matchesStyle =
        userPreferences.style === "natural" ||
        (userPreferences.style === "bold" && ["lips", "eyes"].includes(product.category)) ||
        (userPreferences.style === "minimal" && ["face", "lips"].includes(product.category))
      const matchesColor = userPreferences.colors.includes(product.color) || userPreferences.colors.length === 0
      const matchesBudget = product.price <= userPreferences.budget
      return matchesStyle && matchesColor && matchesBudget
    })

    if (userPreferences.skinTone) {
      filteredProducts = filteredProducts.map((product) => ({
        ...product,
        skinToneMatch: calculateSkinToneMatch(product, userPreferences.skinTone!),
      }))

      filteredProducts.sort((a, b) => {
        const skinToneDiff = (b.skinToneMatch || 0) - (a.skinToneMatch || 0)
        if (Math.abs(skinToneDiff) > 10) return skinToneDiff
        return b.personalityMatch - a.personalityMatch
      })
    } else {
      filteredProducts.sort((a, b) => b.personalityMatch - a.personalityMatch)
    }

    return filteredProducts
  }

  const handleSkinToneAnalysis = async (analysis: SkinToneAnalysis) => {
    const updatedPreferences = {
      ...userPreferences,
      skinTone: analysis,
      colors: [...new Set([...userPreferences.colors, ...analysis.recommendations.bestColors])],
    }

    setUserPreferences(updatedPreferences)
    setShowSkinAnalyzer(false)

    if (currentUser) {
      await DatabaseService.saveSkinToneAnalysis(currentUser.id, analysis)
      console.log("[v0] Skin tone analysis saved to database")
    }
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading your personalized shopping experience...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">AR Shop</h1>
            </div>
            <div className="flex items-center space-x-4">
              {userPreferences.skinTone && (
                <Badge variant="secondary" className="hidden sm:flex">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: userPreferences.skinTone.hex }}
                  ></div>
                  {userPreferences.skinTone.depth} {userPreferences.skinTone.undertone}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowSkinAnalyzer(true)}>
                <Scan className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Skin Analysis</span>
                <span className="sm:hidden">Analyze</span>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{currentUser ? currentUser.email?.split("@")[0] : "Login"}</span>
                  <span className="sm:hidden">{currentUser ? "Profile" : "Login"}</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCart(!showCart)} className="relative">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Cart
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Personalization Panel */}
          <div className="lg:col-span-1">
            <PersonalizationPanel
              preferences={userPreferences}
              onPreferencesChange={setUserPreferences}
              onOpenSkinAnalyzer={() => setShowSkinAnalyzer(true)}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="catalog">Product Catalog</TabsTrigger>
                <TabsTrigger value="3d-viewer">3D Viewer</TabsTrigger>
                <TabsTrigger value="ar-tryOn">AR Try-On</TabsTrigger>
              </TabsList>

              <TabsContent value="catalog" className="mt-6">
                <ProductCatalog
                  products={getPersonalizedProducts()}
                  allProducts={products}
                  onProductSelect={handleProductSelect}
                  onAddToCart={addToCart}
                  hasSkinToneAnalysis={!!userPreferences.skinTone}
                />
              </TabsContent>

              <TabsContent value="3d-viewer" className="mt-6">
                {selectedProduct ? (
                  <ProductViewer product={selectedProduct} onAddToCart={addToCart} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Select a product from the catalog to view in 3D</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ar-tryOn" className="mt-6">
                {selectedProduct ? (
                  <ARTryOn product={selectedProduct} onAddToCart={addToCart} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Select a product to try on with AR</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <ShoppingCart
          items={cartItems}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
        />
      )}

      {/* Skin Tone Analyzer Modal */}
      <SkinToneAnalyzer
        isOpen={showSkinAnalyzer}
        onClose={() => setShowSkinAnalyzer(false)}
        onAnalysisComplete={handleSkinToneAnalysis}
      />

      {/* 3D Product Viewer Modal */}
      {show3DViewer && selectedProduct && (
        <ProductViewer3D
          product={selectedProduct}
          onAddToCart={addToCartWithQuantity}
          onClose={() => setShow3DViewer(false)}
        />
      )}
    </div>
  )
}
