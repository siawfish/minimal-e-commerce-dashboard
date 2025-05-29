'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Plus, X, Upload, Image as ImageIcon } from "lucide-react"
import { useState, useRef } from "react"

export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: null as File | null,
    description: "",
    sizes: [] as string[],
    category: "",
  })

  const [newSize, setNewSize] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    "Sneakers",
    "Slides", 
    "Boots",
    "Apparel",
    "Accessories"
  ]

  const commonSizes = {
    footwear: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13", "14"],
    apparel: ["XS", "S", "M", "L", "XL", "XXL"]
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addSize = (size: string) => {
    if (size && !formData.sizes.includes(size)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, size]
      }))
    }
    setNewSize("")
  }

  const removeSize = (sizeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size !== sizeToRemove)
    }))
  }

  const handleImageSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setFormData(prev => ({
      ...prev,
      image: file
    }))

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleImageSelect(files[0])
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }))
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create FormData for file upload
    const submitData = new FormData()
    submitData.append('name', formData.name)
    submitData.append('price', formData.price)
    submitData.append('description', formData.description)
    submitData.append('category', formData.category)
    submitData.append('sizes', JSON.stringify(formData.sizes))
    
    if (formData.image) {
      submitData.append('image', formData.image)
    }

    // Here you would typically send the FormData to your API
    console.log('Product data:', {
      ...formData,
      image: formData.image?.name || 'No image'
    })
    alert('Product added successfully! (Demo mode)')
  }

  const isFootwearCategory = ["Sneakers", "Slides", "Boots"].includes(formData.category)

  return (
    <div className="min-h-full px-4 sm:px-6 lg:px-8">
      <div className="space-y-6 sm:space-y-8">

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Product Name *
                    </label>
                    <Input
                      placeholder="e.g., YEEZY BOOST 350 V2"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                      className="h-11 sm:h-10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      className="flex min-h-[100px] sm:min-h-[80px] w-full border-b border-zinc-200 bg-white px-3 py-3 sm:py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="Product description..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Price (USD) *
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        required
                        className="h-11 sm:h-10"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Category *
                      </label>
                      <select
                        className="flex h-11 sm:h-10 w-full border-b border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Product Image
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-4 sm:p-6 transition-colors cursor-pointer ${
                        isDragOver 
                          ? 'border-zinc-400 bg-zinc-50' 
                          : 'border-zinc-300 hover:border-zinc-400'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      
                      {formData.image ? (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-sm text-zinc-600 mb-2">
                            <ImageIcon className="h-4 w-4" />
                            <span className="truncate max-w-[200px]">{formData.image.name}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage()
                              }}
                              className="text-red-500 hover:text-red-700 p-1 -m-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-xs text-zinc-500">
                            {(formData.image.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-zinc-400 mb-3 sm:mb-4" />
                          <p className="text-sm text-zinc-600 mb-2">
                            <span className="block sm:inline">Drag and drop an image here,</span>
                            <span className="block sm:inline"> or </span>
                            <span className="text-zinc-900 font-medium">
                              tap to browse files
                            </span>
                          </p>
                          <p className="text-xs text-zinc-500">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Available Sizes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.category && (
                    <div>
                      <p className="text-sm text-zinc-600 mb-3">Quick add common sizes:</p>
                      <div className="flex flex-wrap gap-2">
                        {(isFootwearCategory ? commonSizes.footwear : commonSizes.apparel).map((size) => (
                          <Button
                            key={size}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSize(size)}
                            disabled={formData.sizes.includes(size)}
                            className={`min-h-[40px] min-w-[40px] ${formData.sizes.includes(size) ? 'opacity-50' : ''}`}
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Add custom size
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter size..."
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize(newSize))}
                        className="h-11 sm:h-10"
                      />
                      <Button 
                        type="button"
                        onClick={() => addSize(newSize)}
                        disabled={!newSize}
                        className="min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px]"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {formData.sizes.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-zinc-700 mb-2">Selected sizes:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.sizes.map((size) => (
                          <span
                            key={size}
                            className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-zinc-900 text-white"
                          >
                            {size}
                            <button
                              type="button"
                              onClick={() => removeSize(size)}
                              className="hover:bg-zinc-700 rounded-full p-1 -m-1 min-w-[24px] min-h-[24px] flex items-center justify-center"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Image Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-zinc-400 mb-2" />
                        <span className="text-zinc-400 text-sm">No image selected</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Product Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Name:</span>
                    <span className="font-medium truncate ml-2">{formData.name || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Price:</span>
                    <span className="font-medium">${formData.price || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Category:</span>
                    <span className="font-medium truncate ml-2">{formData.category || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Sizes:</span>
                    <span className="font-medium">{formData.sizes.length} selected</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3 pb-8">
                <Button type="submit" className="flex-1 h-11 sm:h-10">
                  <Save className="mr-2 h-4 w-4" />
                  Save Product
                </Button>
                <Button type="button" variant="outline" className="flex-1 h-11 sm:h-10">
                  Save Draft
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 