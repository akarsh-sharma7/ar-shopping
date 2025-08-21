"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, ShoppingCart, Star, Filter } from "lucide-react"
import Image from "next/image"
import type { Product } from "@/app/page"

interface ProductCatalogProps {
  products: Product[]
  allProducts: Product[]
  onProductSelect: (product: Product) => void
  onAddToCart: (product: Product, size: string) => void
  hasSkinToneAnalysis: boolean
}

export function ProductCatalog({
  products,
  allProducts,
  onProductSelect,
  onAddToCart,
  hasSkinToneAnalysis,
}: ProductCatalogProps) {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [selectedBrand, setSelectedBrand] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recommended")

  // Get unique brands and categories
  const brands = [...new Set(allProducts.map((product) => product.brand))].sort()
  const categories = [...new Set(allProducts.map((product) => product.category))].sort()

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }))
  }

  const handleAddToCart = (product: Product) => {
    const selectedSize = selectedSizes[product.id] || product.size[0]
    onAddToCart(product, selectedSize)
  }

  // Filter and sort products
  const getFilteredProducts = () => {
    let filtered = products

    // Filter by brand
    if (selectedBrand !== "all") {
      filtered = filtered.filter((product) => product.brand === selectedBrand)
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "popular":
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
      case "recommended":
      default:
        // Already sorted by recommendation in parent component
        break
    }

    return filtered
  }

  const filteredProducts = getFilteredProducts()

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{selectedBrand !== "all" ? selectedBrand : "All Brands"}</h2>
          <Badge variant="secondary" className="text-sm mt-1">
            {filteredProducts.length} products
            {hasSkinToneAnalysis && " • Skin tone matched"}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="lips">Lips</SelectItem>
              <SelectItem value="eyes">Eyes</SelectItem>
              <SelectItem value="face">Face</SelectItem>
              <SelectItem value="cheeks">Cheeks</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 space-y-1">
                  <Badge variant="secondary" className="bg-white/90 text-xs">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {product.rating}
                  </Badge>
                  {hasSkinToneAnalysis && product.skinToneMatch && (
                    <Badge
                      variant={
                        product.skinToneMatch >= 90 ? "default" : product.skinToneMatch >= 70 ? "secondary" : "outline"
                      }
                      className="bg-green-100 text-green-800 text-xs block"
                    >
                      {product.skinToneMatch}% match
                    </Badge>
                  )}
                </div>
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="bg-white/90 text-xs">
                    {product.brand}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              <CardTitle className="text-lg mb-2 line-clamp-2">{product.name}</CardTitle>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                <div className="text-right">
                  <Badge variant="outline" className="capitalize text-xs">
                    {product.category}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{product.reviews} reviews</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Size</label>
                  <Select
                    value={selectedSizes[product.id] || product.size[0]}
                    onValueChange={(size) => handleSizeChange(product.id, size)}
                  >
                    <SelectTrigger className="w-full">
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
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 space-y-2">
              <div className="flex space-x-2 w-full">
                <Button variant="outline" size="sm" onClick={() => onProductSelect(product)} className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View 3D
                </Button>
                <Button size="sm" onClick={() => handleAddToCart(product)} className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters or search criteria</p>
          <Button
            variant="outline"
            className="mt-4 bg-transparent"
            onClick={() => {
              setSelectedBrand("all")
              setSelectedCategory("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
