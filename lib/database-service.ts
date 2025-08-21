"use client"

import { supabase } from "@/lib/supabase/client"
import type { SkinToneAnalysis } from "@/components/skin-tone-analyzer"
import type { CartItem, UserPreferences } from "@/app/page"

export interface UserProfile {
  id: string
  email: string
  skin_tone_hex?: string
  skin_tone_depth?: string
  skin_tone_undertone?: string
  style_preferences?: string[]
  color_preferences?: string[]
  budget_min?: number
  budget_max?: number
  created_at: string
  updated_at: string
}

export interface CartItemDB {
  id: string
  user_id: string
  product_id: string
  product_name: string
  product_brand: string
  product_price: number
  product_image?: string
  size: string
  quantity: number
  created_at: string
  updated_at: string
}

export class DatabaseService {
  // User Profile Management
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getUserProfile:", error)
      return null
    }
  }

  static async createUserProfile(userId: string, email: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          id: userId,
          email: email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating user profile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in createUserProfile:", error)
      return null
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("Error updating user profile:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in updateUserProfile:", error)
      return false
    }
  }

  // Skin Tone Analysis Storage
  static async saveSkinToneAnalysis(userId: string, analysis: SkinToneAnalysis): Promise<boolean> {
    try {
      const updates = {
        skin_tone_hex: analysis.hex,
        skin_tone_depth: analysis.depth,
        skin_tone_undertone: analysis.undertone,
        color_preferences: analysis.recommendations.bestColors,
      }

      return await this.updateUserProfile(userId, updates)
    } catch (error) {
      console.error("Error saving skin tone analysis:", error)
      return false
    }
  }

  // User Preferences Management
  static async saveUserPreferences(userId: string, preferences: UserPreferences): Promise<boolean> {
    try {
      const updates = {
        style_preferences: [preferences.style],
        color_preferences: preferences.colors,
        budget_min: 0,
        budget_max: preferences.budget,
      }

      if (preferences.skinTone) {
        updates.skin_tone_hex = preferences.skinTone.hex
        updates.skin_tone_depth = preferences.skinTone.depth
        updates.skin_tone_undertone = preferences.skinTone.undertone
      }

      return await this.updateUserProfile(userId, updates)
    } catch (error) {
      console.error("Error saving user preferences:", error)
      return false
    }
  }

  static async loadUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const profile = await this.getUserProfile(userId)
      if (!profile) return null

      const preferences: UserPreferences = {
        style: profile.style_preferences?.[0] || "natural",
        colors: profile.color_preferences || ["pink", "brown"],
        size: "standard",
        budget: profile.budget_max || 16600,
        occasions: ["daily", "evening"],
      }

      // Reconstruct skin tone analysis if available
      if (profile.skin_tone_hex && profile.skin_tone_depth && profile.skin_tone_undertone) {
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
          return result
            ? {
                r: Number.parseInt(result[1], 16),
                g: Number.parseInt(result[2], 16),
                b: Number.parseInt(result[3], 16),
              }
            : { r: 0, g: 0, b: 0 }
        }

        const generateRecommendations = (undertone: string) => {
          const recommendations = {
            warm: {
              bestColors: ["coral", "gold", "bronze", "brown", "red"],
              avoidColors: ["pink", "silver", "blue"],
            },
            cool: {
              bestColors: ["pink", "berry", "silver", "blue", "purple"],
              avoidColors: ["coral", "gold", "bronze"],
            },
            neutral: {
              bestColors: ["nude", "beige", "rose", "taupe", "mauve"],
              avoidColors: [],
            },
          }

          const foundationShades = {
            fair: { warm: "Fair Warm", cool: "Fair Cool", neutral: "Fair Neutral" },
            light: { warm: "Light Warm", cool: "Light Cool", neutral: "Light Neutral" },
            medium: { warm: "Medium Warm", cool: "Medium Cool", neutral: "Medium Neutral" },
            tan: { warm: "Tan Warm", cool: "Tan Cool", neutral: "Tan Neutral" },
            deep: { warm: "Deep Warm", cool: "Deep Cool", neutral: "Deep Neutral" },
          }

          const undertoneKey = undertone as keyof typeof recommendations
          const depthKey = profile.skin_tone_depth as keyof typeof foundationShades

          return {
            bestColors: recommendations[undertoneKey]?.bestColors || [],
            avoidColors: recommendations[undertoneKey]?.avoidColors || [],
            foundationShade: foundationShades[depthKey]?.[undertoneKey] || "Medium Neutral",
          }
        }

        preferences.skinTone = {
          undertone: profile.skin_tone_undertone as "warm" | "cool" | "neutral",
          depth: profile.skin_tone_depth as "fair" | "light" | "medium" | "tan" | "deep",
          hex: profile.skin_tone_hex,
          rgb: hexToRgb(profile.skin_tone_hex),
          confidence: 85,
          recommendations: generateRecommendations(profile.skin_tone_undertone),
        }
      }

      return preferences
    } catch (error) {
      console.error("Error loading user preferences:", error)
      return null
    }
  }

  // Shopping Cart Management
  static async saveCartItem(userId: string, item: CartItem): Promise<boolean> {
    try {
      const { error } = await supabase.from("user_cart").upsert(
        {
          user_id: userId,
          product_id: item.id,
          product_name: item.name,
          product_brand: item.brand,
          product_price: item.price,
          product_image: item.image,
          size: item.selectedSize,
          quantity: item.quantity,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,product_id,size",
        },
      )

      if (error) {
        console.error("Error saving cart item:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in saveCartItem:", error)
      return false
    }
  }

  static async loadUserCart(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from("user_cart")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading user cart:", error)
        return []
      }

      // Convert database cart items to CartItem format
      return data.map((dbItem: CartItemDB) => ({
        id: dbItem.product_id,
        name: dbItem.product_name,
        price: dbItem.product_price,
        brand: dbItem.product_brand,
        image: dbItem.product_image || "",
        selectedSize: dbItem.size,
        quantity: dbItem.quantity,
        // Default values for required fields
        category: "lips",
        color: "red",
        size: [dbItem.size],
        model3d: "/assets/3d/duck.glb",
        description: "",
        personalityMatch: 85,
        rating: 4.5,
        reviews: 100,
      }))
    } catch (error) {
      console.error("Error in loadUserCart:", error)
      return []
    }
  }

  static async removeCartItem(userId: string, productId: string, size: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_cart")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)
        .eq("size", size)

      if (error) {
        console.error("Error removing cart item:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in removeCartItem:", error)
      return false
    }
  }

  static async clearUserCart(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("user_cart").delete().eq("user_id", userId)

      if (error) {
        console.error("Error clearing user cart:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in clearUserCart:", error)
      return false
    }
  }

  // AR Session Tracking
  static async logARSession(userId: string, productId: string, sessionData: any): Promise<boolean> {
    try {
      // This could be extended to track AR usage analytics
      console.log("[v0] AR session logged:", { userId, productId, sessionData })
      return true
    } catch (error) {
      console.error("Error logging AR session:", error)
      return false
    }
  }
}
