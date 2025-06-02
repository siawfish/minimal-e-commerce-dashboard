# Firebase Storage Security Rules

Replace your current Firebase Storage rules with these rules to allow product uploads for authenticated users:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Rules for product images
    match /products/{imageId} {
      // Allow anyone to read product images (for public display)
      allow read: if true;
      
      // Allow write only for authenticated users with restrictions
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024  // Max 5MB
        && request.resource.contentType.matches('image/.*');  // Only images
    }
    
    // Optional: Rules for user profile images
    match /users/{userId}/profile/{imageId} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.uid == userId
        && request.resource.size < 2 * 1024 * 1024  // Max 2MB
        && request.resource.contentType.matches('image/.*');
    }
    
    // Deny all other paths by default
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Key Features of These Rules:

1. **Product Images (`/products/{imageId}`):**
   - ✅ **Public Read**: Anyone can view product images
   - ✅ **Authenticated Write**: Only logged-in users can upload
   - ✅ **File Size Limit**: Maximum 5MB per image
   - ✅ **Image Only**: Only image files allowed

2. **User Profile Images (Optional):**
   - ✅ **Public Read**: Profile images are publicly viewable
   - ✅ **Owner Write**: Only the user can upload their own profile image
   - ✅ **Smaller Size Limit**: 2MB for profile images

3. **Security:**
   - ❌ **Default Deny**: All other paths are blocked
   - ✅ **Authentication Required**: Must be logged in to upload
   - ✅ **File Type Validation**: Only images allowed
   - ✅ **Size Limits**: Prevents large file uploads

## How to Apply These Rules:

1. Go to Firebase Console → Storage → Rules
2. Replace the existing rules with the code above
3. Click "Publish" to apply the changes
4. Test your product upload functionality

## Testing the Rules:

You can test these rules in the Firebase Rules Playground:
- Set "Authenticated" to ON
- Use path: `/products/test-image.jpg`
- Set simulation type to "write"
- Should return: **Allow** 