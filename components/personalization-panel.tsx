"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { User, Palette, DollarSign, Calendar, Scan } from "lucide-react"
import type { UserPreferences } from "@/app/page"
import { Button } from "@/components/ui/button"

interface PersonalizationPanelProps {
  preferences: UserPreferences
  onPreferencesChange: (preferences: UserPreferences) => void
  onOpenSkinAnalyzer: () => void
}

export function PersonalizationPanel({
  preferences,
  onPreferencesChange,
  onOpenSkinAnalyzer,
}: PersonalizationPanelProps) {
  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    onPreferencesChange({ ...preferences, [key]: value })
  }

  const toggleColor = (color: string) => {
    const colors = preferences.colors.includes(color)
      ? preferences.colors.filter((c) => c !== color)
      : [...preferences.colors, color]
    updatePreference("colors", colors)
  }

  const toggleOccasion = (occasion: string) => {
    const occasions = preferences.occasions.includes(occasion)
      ? preferences.occasions.filter((o) => o !== occasion)
      : [...preferences.occasions, occasion]
    updatePreference("occasions", occasions)
  }

  const availableColors = [
    "red",
    "pink",
    "brown",
    "black",
    "nude",
    "coral",
    "berry",
    "gold",
    "bronze",
    "clear",
    "beige",
  ]
  const availableOccasions = ["daily", "work", "evening", "special", "wedding", "party", "date"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Your Style Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Style Preference</label>
            <Select value={preferences.style} onValueChange={(value) => updatePreference("style", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">Natural</SelectItem>
                <SelectItem value="bold">Bold & Dramatic</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="glam">Glamorous</SelectItem>
                <SelectItem value="vintage">Vintage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Preferred Size</label>
            <Select value={preferences.size} onValueChange={(value) => updatePreference("size", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="travel">Travel Size</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="full">Full Size</SelectItem>
                <SelectItem value="jumbo">Jumbo Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Color Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {availableColors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={color}
                  checked={preferences.colors.includes(color)}
                  onCheckedChange={() => toggleColor(color)}
                />
                <label
                  htmlFor={color}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {color}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {preferences.colors.map((color) => (
              <Badge key={color} variant="secondary" className="text-xs capitalize">
                {color}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Budget Range</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Max Budget</span>
              <span className="text-sm font-bold">₹{preferences.budget}</span>
            </div>
            <Slider
              value={[preferences.budget]}
              onValueChange={([value]) => updatePreference("budget", value)}
              max={83000}
              min={4150}
              step={4150}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹4,150</span>
              <span>₹83,000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Occasions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {availableOccasions.map((occasion) => (
              <div key={occasion} className="flex items-center space-x-2">
                <Checkbox
                  id={occasion}
                  checked={preferences.occasions.includes(occasion)}
                  onCheckedChange={() => toggleOccasion(occasion)}
                />
                <label
                  htmlFor={occasion}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {occasion}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {preferences.occasions.map((occasion) => (
              <Badge key={occasion} variant="secondary" className="text-xs capitalize">
                {occasion}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Scan className="h-5 w-5" />
            <span>Skin Tone Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {preferences.skinTone ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-gray-200"
                  style={{ backgroundColor: preferences.skinTone.hex }}
                ></div>
                <div>
                  <p className="font-medium capitalize">
                    {preferences.skinTone.depth} {preferences.skinTone.undertone}
                  </p>
                  <p className="text-sm text-gray-600">{preferences.skinTone.confidence}% confidence</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Best Colors:</p>
                <div className="flex flex-wrap gap-1">
                  {preferences.skinTone.recommendations.bestColors.map((color) => (
                    <Badge key={color} variant="secondary" className="text-xs capitalize">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={onOpenSkinAnalyzer} className="w-full bg-transparent">
                Re-analyze
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Scan className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Get Personalized Recommendations</p>
                <p className="text-sm text-gray-600">Analyze your skin tone for better color matching</p>
              </div>
              <Button onClick={onOpenSkinAnalyzer} className="w-full">
                Analyze Skin Tone
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
