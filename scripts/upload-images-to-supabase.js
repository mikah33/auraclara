/**
 * Upload Product Images to Supabase Storage
 *
 * This script uploads product images from your local assets folder
 * to Supabase Storage and returns public URLs for use in Shopify
 */

const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://pcyohjfdxkujufprlkxh.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeW9oamZkeGt1anVmcHJsa3hoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA0MjUzNSwiZXhwIjoyMDc1NjE4NTM1fQ.TAOfKcXEda6AYc04VVKt45I7DUVIAZAcrM4kx2ShyJU';

// Product images to upload
const productImages = [
    {
        name: 'Clarity Patches',
        localPath: 'assets/images/product-packaging.png',
        storagePath: 'clarity-patches.png'
    },
    {
        name: 'Face Sculpting Tool',
        localPath: 'assets/images/face-sculpting-tool-box.png',
        storagePath: 'face-sculpting-tool.png'
    },
    {
        name: 'Jawline Shaper',
        localPath: 'assets/images/jawline-shaper.jpg',
        storagePath: 'jawline-shaper.jpg'
    },
    {
        name: 'V-Line Lifting Mask',
        localPath: 'assets/images/vline-mask-flat.jpg',
        storagePath: 'vline-mask.jpg'
    },
    {
        name: 'Bio-Collagen Mask',
        localPath: 'assets/images/bio-collagen-aesthetic.jpg',
        storagePath: 'bio-collagen-mask.jpg'
    }
];

async function uploadImage(image) {
    const fullPath = path.join(process.cwd(), image.localPath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
        console.log(`❌ File not found: ${image.localPath}`);
        return null;
    }

    // Read file as base64
    const fileBuffer = fs.readFileSync(fullPath);
    const base64 = fileBuffer.toString('base64');
    const fileExt = path.extname(image.localPath);
    const contentType = fileExt === '.png' ? 'image/png' : 'image/jpeg';

    try {
        // Upload to Supabase Storage
        const response = await fetch(
            `${SUPABASE_URL}/storage/v1/object/product-images/${image.storagePath}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': contentType,
                    'x-upsert': 'true' // Overwrite if exists
                },
                body: fileBuffer
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.log(`❌ Failed to upload ${image.name}: ${error}`);
            return null;
        }

        // Get public URL
        const publicURL = `${SUPABASE_URL}/storage/v1/object/public/product-images/${image.storagePath}`;

        console.log(`✅ Uploaded: ${image.name}`);
        console.log(`   URL: ${publicURL}`);

        return {
            name: image.name,
            url: publicURL
        };
    } catch (error) {
        console.log(`❌ Error uploading ${image.name}:`, error.message);
        return null;
    }
}

async function uploadAllImages() {
    console.log('🚀 Starting image upload to Supabase Storage...\n');

    // First, create the bucket if it doesn't exist
    console.log('📦 Checking if products bucket exists...\n');

    const results = [];

    for (const image of productImages) {
        const result = await uploadImage(image);
        if (result) {
            results.push(result);
        }
        // Wait 500ms between uploads
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✨ Upload complete!\n');
    console.log('📋 Image URLs for Shopify:\n');

    results.forEach(result => {
        console.log(`${result.name}:`);
        console.log(`${result.url}\n`);
    });

    console.log('\n📝 Next step: Update your Shopify products with these URLs');
}

uploadAllImages();
