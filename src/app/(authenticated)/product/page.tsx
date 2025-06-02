'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Plus, X, Upload, Image as ImageIcon, Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { createProduct, updateProduct, getProductById, validateProductData } from "@/lib/products"
import type { CreateProductData } from "@/types/firebase"
import { useToast } from "@/components/ui/toast"
import { useSearchParams, useRouter } from "next/navigation"

export default function ProductForm() {
  const { showToast, ToastComponent } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = searchParams.get('id')
  const isEditMode = !!productId
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    images: [] as File[],
    description: "",
    sizes: [] as string[],
    category: "",
    quantity: "",
  })

  const [newSize, setNewSize] = useState("")
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = [
    "Shoes",
    "Bags", 
    "Clothing",
    "Accessories",
    "Watches",
    "Jewelry",
    "Hairs",
    "Other"
  ]

  const commonSizes = {
    footwear: ["6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "13", "14"],
    apparel: ["XS", "S", "M", "L", "XL", "XXL"]
  }

  // Fetch product data for edit mode
  useEffect(() => {
    const fetchProduct = async () => {
      if (isEditMode && productId) {
        setIsLoading(true)
        try {
          const product = await getProductById(productId)
          if (product) {
            setFormData({
              name: product.name,
              price: product.price.toString(),
              images: [], // Don't set the existing images as Files
              description: product.description,
              sizes: product.sizes,
              category: product.category,
              quantity: product.quantity.toString(),
            })
            
            // Set existing image URLs for preview
            if (product.images && product.images.length > 0) {
              setExistingImageUrls(product.images)
              setImagePreviews(product.images)
            }
          } else {
            showToast('Product not found', 'error')
            router.push('/products')
          }
        } catch (error) {
          console.error('Error fetching product:', error)
          showToast('Failed to load product', 'error')
          router.push('/products')
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchProduct()
  }, [isEditMode, productId])

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

  const handleImageSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles: File[] = []

    for (const file of fileArray) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast(`${file.name} is not a valid image file`, 'error')
        continue
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast(`${file.name} is too large (max 5MB)`, 'error')
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Check if adding these files would exceed the maximum
    const maxImages = 10
    const currentImageCount = formData.images.length + existingImageUrls.filter(url => !removedImageUrls.includes(url)).length
    const availableSlots = maxImages - currentImageCount

    if (validFiles.length > availableSlots) {
      showToast(`Can only add ${availableSlots} more image(s). Maximum ${maxImages} images allowed.`, 'error')
      return
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }))

    // Create previews for new files
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreviews(prev => [...prev, result])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleImageSelect(files)
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
      handleImageSelect(files)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    
    // Remove from imagePreviews (only the new image previews, not existing ones)
    const newImagePreviews = imagePreviews.filter(preview => !existingImageUrls.includes(preview))
    const updatedNewPreviews = newImagePreviews.filter((_, i) => i !== index)
    setImagePreviews([...existingImageUrls.filter(url => !removedImageUrls.includes(url)), ...updatedNewPreviews])
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeExistingImage = (imageUrl: string) => {
    // Add to removed list
    setRemovedImageUrls(prev => [...prev, imageUrl])
    
    // Remove from existing images list
    setExistingImageUrls(prev => prev.filter(url => url !== imageUrl))
    
    // Update imagePreviews to reflect the removal
    const newImagePreviews = imagePreviews.filter(preview => !existingImageUrls.includes(preview))
    setImagePreviews([...existingImageUrls.filter(url => url !== imageUrl && !removedImageUrls.includes(url)), ...newImagePreviews])
  }

  const removeImageFromPreview = (imageUrl: string) => {
    if (existingImageUrls.includes(imageUrl)) {
      // It's an existing image
      removeExistingImage(imageUrl)
    } else {
      // It's a new image - find its index in the new images array
      const newImagePreviews = imagePreviews.filter(preview => !existingImageUrls.includes(preview))
      const newImageIndex = newImagePreviews.findIndex(preview => preview === imageUrl)
      if (newImageIndex !== -1) {
        removeImage(newImageIndex)
      }
    }
  }

  const getAllImagePreviews = () => {
    const existingUrls = existingImageUrls.filter(url => !removedImageUrls.includes(url))
    const newImagePreviews = imagePreviews.filter(preview => !existingImageUrls.includes(preview))
    return [...existingUrls, ...newImagePreviews]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    
    // Prepare data for validation and submission
    const productData: CreateProductData = {
      name: formData.name,
      price: formData.price,
      description: formData.description,
      category: formData.category,
      sizes: formData.sizes,
      images: formData.images,
      existingImages: existingImageUrls,
      removedImageUrls: removedImageUrls,
      quantity: formData.quantity,
    }

    // Check if we have at least one image (new or existing)
    const remainingExistingImages = existingImageUrls.filter(url => !removedImageUrls.includes(url))
    const hasImages = (formData.images && formData.images.length > 0) || remainingExistingImages.length > 0
    
    if (!hasImages) {
      setSubmitError('At least one image is required')
      return
    }

    // For validation, we need to provide either new images or existing images
    // The validateProductData function doesn't check images anyway, but we maintain compatibility
    const validationData: CreateProductData = {
      ...productData,
      images: formData.images.length > 0 ? [formData.images[0]] : undefined,
      existingImages: remainingExistingImages.length > 0 ? remainingExistingImages : undefined,
    }

    const validationErrors = validateProductData(validationData)
    if (validationErrors.length > 0) {
      setSubmitError(validationErrors.join(', '))
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditMode && productId) {
        // Update existing product
        await updateProduct(productId, productData)
        showToast(`Product "${formData.name}" updated successfully!`, 'success')
        router.push('/products')
      } else {
        // Create new product
        const newProductId = await createProduct(productData)
        showToast(`Product "${formData.name}" created successfully! (ID: ${newProductId.slice(0, 8)}...)`, 'success')
        
        // Reset form for create mode
        setFormData({
          name: "",
          price: "",
          images: [],
          description: "",
          sizes: [],
          category: "",
          quantity: "",
        })
        setImagePreviews([])
        setExistingImageUrls([])
        setRemovedImageUrls([])
        setNewSize("")
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'create'} product`
      setSubmitError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    setSubmitError(null)
    
    // For draft, we can be more lenient with validation
    if (!formData.name.trim()) {
      const errorMessage = 'Product name is required to save draft'
      setSubmitError(errorMessage)
      showToast(errorMessage, 'error')
      return
    }

    setIsSubmitting(true)

    try {
      const draftData: CreateProductData = {
        name: formData.name + " (Draft)",
        price: formData.price || "0",
        description: formData.description || "Draft product",
        category: formData.category || "Uncategorized",
        sizes: formData.sizes.length > 0 ? formData.sizes : ["One Size"],
        images: formData.images.length > 0 ? formData.images : undefined,
        quantity: formData.quantity || "0",
      }

      const productId = await createProduct(draftData)
      showToast(`Draft "${formData.name}" saved successfully! (ID: ${productId.slice(0, 8)}...)`, 'success')
      
    } catch (error) {
      console.error('Error saving draft:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save draft'
      setSubmitError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFootwearCategory = ["Sneakers", "Slides", "Boots"].includes(formData.category)

  // Add loading state to the render
  if (isLoading) {
    return (
      <div className="min-h-full px-4 sm:px-6 lg:px-8">
        {ToastComponent}
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading product...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full px-4 sm:px-6 lg:px-8 pb-10">
      {ToastComponent}
      <div className="space-y-6 sm:space-y-8">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isEditMode ? 'Update your product details below.' : 'Fill in the details to create a new product.'}
          </p>
        </div>

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
                        Price (GHS) *
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
                        Quantity *
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        min="0"
                        step="1"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        required
                        className="h-11 sm:h-10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-1">
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
                      Product Images (Max 10)
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
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      
                      {formData.images.length > 0 ? (
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-sm text-zinc-600 mb-2">
                            <ImageIcon className="h-4 w-4" />
                            <span>{formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected</span>
                          </div>
                          <p className="text-xs text-zinc-500 mb-3">
                            Total: {(formData.images.reduce((acc, img) => acc + img.size, 0) / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative bg-zinc-100 rounded border p-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-zinc-600 truncate flex-1 mr-2">
                                    {image.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeImage(index)
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1 -m-1 min-w-[24px] min-h-[24px] flex items-center justify-center"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                <p className="text-xs text-zinc-400 mt-1">
                                  {(image.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-zinc-500 mt-3">
                            Click to add more images
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-zinc-400 mb-3 sm:mb-4" />
                          <p className="text-sm text-zinc-600 mb-2">
                            <span className="block sm:inline">Drag and drop images here,</span>
                            <span className="block sm:inline"> or </span>
                            <span className="text-zinc-900 font-medium">
                              tap to browse files
                            </span>
                          </p>
                          <p className="text-xs text-zinc-500">
                            PNG, JPG, GIF up to 5MB each. Maximum 10 images.
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
                  <CardTitle className="text-lg sm:text-xl">Image Preview{getAllImagePreviews().length > 1 ? 's' : ''}</CardTitle>
                </CardHeader>
                <CardContent>
                  {getAllImagePreviews().length > 0 ? (
                    <div className="grid gap-3">
                      {getAllImagePreviews().length === 1 ? (
                        <div className="relative">
                          <div className="aspect-square bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden">
                            <img 
                              src={getAllImagePreviews()[0]} 
                              alt="Product preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* Remove button overlay */}
                          <button
                            type="button"
                            onClick={() => {
                              const imageUrl = getAllImagePreviews()[0]
                              removeImageFromPreview(imageUrl)
                            }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* Main preview */}
                          <div className="relative">
                            <div className="aspect-square bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden">
                              <img 
                                src={getAllImagePreviews()[0]} 
                                alt="Main product preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {/* Remove button overlay */}
                            <button
                              type="button"
                              onClick={() => {
                                const imageUrl = getAllImagePreviews()[0]
                                removeImageFromPreview(imageUrl)
                              }}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          {/* Thumbnail grid */}
                          <div className="grid grid-cols-3 gap-2">
                            {getAllImagePreviews().slice(1, 7).map((preview, index) => (
                              <div key={index + 1} className="relative">
                                <div className="aspect-square bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden">
                                  <img 
                                    src={preview} 
                                    alt={`Product preview ${index + 2}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {/* Remove button overlay */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    removeImageFromPreview(preview)
                                  }}
                                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-lg"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                            {getAllImagePreviews().length > 7 && (
                              <div className="aspect-square bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                                <span className="text-xs text-zinc-500 font-medium">
                                  +{getAllImagePreviews().length - 6} more
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden">
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-zinc-400 mb-2" />
                        <span className="text-zinc-400 text-sm">No images selected</span>
                      </div>
                    </div>
                  )}
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
                    <span className="font-medium">₵{formData.price || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Quantity:</span>
                    <span className="font-medium">{formData.quantity || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Category:</span>
                    <span className="font-medium truncate ml-2">{formData.category || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Images:</span>
                    <span className="font-medium">{getAllImagePreviews().length} selected</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Sizes:</span>
                    <span className="font-medium">{formData.sizes.length} selected</span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3 pb-8">
                <Button 
                  type="submit" 
                  className="flex-1 h-11 sm:h-10" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditMode ? 'Update Product' : 'Save Product'}
                    </>
                  )}
                </Button>
                {!isEditMode && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-11 sm:h-10"
                    onClick={handleSaveDraft}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Draft"
                    )}
                  </Button>
                )}
              </div>

              {submitError && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {submitError}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 

