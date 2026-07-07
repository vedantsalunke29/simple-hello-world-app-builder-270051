# Image Generation Integration

Generate images with `GoogleGenerativeAIImage`, upload the generated image data to the configured storage provider, and return a signed download URL.

## Environment Variables

- `IMAGE_GENERATION_MODEL` - Google image generation model, for example `gemini-2.5-flash-image`.
- `INFRA_PROVIDER` - Storage provider. Supported values: `aws`, `gcp`, `azure`.

**IMPORTANT:** Always use `process.env.IMAGE_GENERATION_MODEL` for image generation.
**IMPORTANT:** Select storage from `process.env.INFRA_PROVIDER`; do not hardcode a storage provider.

## Imports

Use `@uptiqai/integrations-sdk` for both image generation and storage. Do not install direct Google AI, AWS, Google Cloud, or Azure SDK packages.

```typescript
import { AwsS3, AzureBlobStorage, GoogleCloudStorage, GoogleGenerativeAIImage } from '@uptiqai/integrations-sdk';
import { Hono } from 'hono';
```

## Storage Selection

Choose the storage class with a `switch` on `process.env.INFRA_PROVIDER`.

```typescript
const getStorage = () => {
    switch (process.env.INFRA_PROVIDER?.toLowerCase()) {
        case 'aws':
            return new AwsS3();
        case 'gcp':
            return new GoogleCloudStorage();
        case 'azure':
            return new AzureBlobStorage();
        default:
            throw new Error('Unsupported INFRA_PROVIDER. Use aws, gcp, or azure.');
    }
};
```

The selected storage instance must support the common storage methods:

- `uploadData({ data, destinationKey, contentType })`
- `generateDownloadSignedUrl({ key })`

## Controller Flow

Use the `generateImage` method from the `GoogleGenerativeAIImage` class. This should be a simple Hono route: read the request body, pass the image generation fields directly, upload the returned binary image data as base64, then generate a signed URL.

```typescript
const app = new Hono();

app.post('/generate-image', async c => {
    const body = await c.req.json();

    const googleGenerativeAIImage = new GoogleGenerativeAIImage();
    const imageResponse = (await googleGenerativeAIImage.generateImage({
        prompt: body.prompt,
        model: process.env.IMAGE_GENERATION_MODEL || 'gemini-2.5-flash-image',
        negativePrompt: body.negativePrompt,
        aspectRatio: body.aspectRatio
    })) as any;

    const imageBuffer = imageResponse.data as Buffer;
    const base64Data = imageBuffer.toString('base64');
    const contentType = imageResponse.headers?.['content-type'] ?? 'image/png';
    const extension = contentType.split('/')[1] || 'png';

    const storage = getStorage();
    const storageKey = `generated-images/${crypto.randomUUID()}.${extension}`;

    await storage.uploadData({
        data: base64Data,
        destinationKey: storageKey,
        contentType
    });

    const signedUrl = await storage.generateDownloadSignedUrl({
        key: storageKey,
        fileName: `generated-image.${extension}`
    });

    return c.json({
        url: signedUrl.url,
        storageKey,
        mimeType: contentType,
        fileSize: imageBuffer.byteLength
    });
});
```

## Key Points

- The generated image response is an Axios-style binary response, not a `File` or `Blob`.
- Read the image bytes from `imageResponse.data`.
- Upload a base64 string with `uploadData`; do not upload the raw `Buffer`.
- Return `signedUrl.url` and `storageKey`; save `storageKey` if image history or future URL regeneration is needed.
- Use `AwsS3`, `GoogleCloudStorage`, or `AzureBlobStorage` only through the `INFRA_PROVIDER` switch.
- Do not call `prepareIntegrationMethodRequest` or wrap the image generation payload in `config` and `request`.
- Add database model if you need image history/gallery features
