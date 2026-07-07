# Always use "@uptiqai/integrations-sdk" for storage integration

Do not install or import direct cloud storage packages. File storage must go through `@uptiqai/integrations-sdk`.

## Forbidden Dependencies

Never install or import these packages. They are already wrapped in `@uptiqai/integrations-sdk`:

- `@aws-sdk/client-s3` - AWS S3 SDK
- `@google-cloud/storage` - Google Cloud Storage
- `@azure/storage-blob` - Azure Blob Storage
- `aws-sdk` - Legacy AWS SDK
- `multer-s3` - S3 upload middleware

## Import

Choose the SDK class based on `process.env.INFRA_PROVIDER` or the user's prompt. Do not use the generic `Storage` class.

```ts
import { AwsS3, AzureBlobStorage, GoogleCloudStorage } from '@uptiqai/integrations-sdk';
```

## Provider Selection

- Use `AwsS3` when the prompt asks for AWS, S3, or Amazon S3 storage.
- Use `GoogleCloudStorage` when the prompt asks for Google Cloud Storage, GCS, or Google storage.
- Use `AzureBlobStorage` when the prompt asks for Azure Blob Storage or Azure storage.
- When using `process.env.INFRA_PROVIDER`, normalize it to lowercase before switching. Supported values are `GCP`, `AWS`, and `AZURE`.

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
            throw new Error('Unsupported INFRA_PROVIDER. Use aws, google, or azure.');
    }
};
```

## Config Types: Shared vs PerUser

Storage integrations support two configuration modes. Choose the mode based on the user's request and the app's integration configuration.

### **Shared Config**

- The selected storage provider credentials are shared by all users and are already configured. Do not ask users for cloud credentials in this mode.

## Storage: Common Methods (Shared Config)

The same method shape applies to `AwsS3`, `GoogleCloudStorage`, and `AzureBlobStorage`. Use `getStorage()` to select the configured provider from `process.env.INFRA_PROVIDER`.

### Upload File

```ts
const storage = getStorage();

const result = await storage.uploadFile({
    file: file as Blob,
    destinationKey: 'path/to/file.pdf'
});
```

### Upload Data

```ts
const storage = getStorage();

const result = await storage.uploadData({
    data: base64String,
    destinationKey: 'path/to/file.png',
    contentType: 'image/png'
});
```

### Generate Upload Signed URL

```ts
const storage = getStorage();

const result = await storage.generateUploadSignedUrl({
    key: 'path/to/upload.pdf',
    contentType: 'application/pdf'
});
```

### Generate Download Signed URL

```ts
const storage = getStorage();

const result = await storage.generateDownloadSignedUrl({
    key: 'path/to/file.pdf',
    fileName: 'download-name.pdf'
});
```

### Check Document Exists

```ts
const storage = getStorage();

const result = await storage.documentExists({
    key: 'path/to/file.pdf'
});
```

### Get Data

```ts
const storage = getStorage();

const result = await storage.getData({
    key: 'path/to/file.pdf'
});
```

### Create Read Stream

```ts
const storage = getStorage();

const response = await storage.createReadStream({
    key: 'path/to/file.pdf',
    contentType: 'application/pdf',
    fileName: 'download.pdf'
});
```

### Copy File

```ts
const storage = getStorage();

const result = await storage.copyFile({
    srcKey: 'source/path/file.pdf',
    destinationKey: 'destination/path/file.pdf'
});
```

### Get File Metadata

```ts
const storage = getStorage();

const result = await storage.getFileMetadata({
    key: 'path/to/file.pdf'
});
```

### Delete File

```ts
const storage = getStorage();

const result = await storage.deleteFile({
    key: 'path/to/file.pdf'
});
```

### Create Write Stream

`createWriteStream` is available for `GoogleCloudStorage` and `AzureBlobStorage`. Use `uploadFile` or `uploadData` for AWS S3 unless the SDK exposes write streams for S3.

```ts
const storage = getStorage();

// Only call this when INFRA_PROVIDER is gcp or azure.
const result = await storage.createWriteStream(fileBlob, {
    key: 'path/to/file.pdf'
});
```

### **Per User Config**

- Users must provide the selected storage provider credentials before they can perform storage operations.
- Assume `prisma`, auth middleware, and `ApiError` already exist in the app, or import them from the app's existing utilities.
- Use the same storage methods in PerUser config, but pass `userId` for operations that accept it, such as `uploadData`, `generateUploadSignedUrl`, `generateDownloadSignedUrl`, `getData`, `documentExists`, `copyFile`, `getFileMetadata`, `createReadStream`, and `deleteFile`.

Step 1: Connect User's AWS S3 Credentials (PerUser Config)

```typescript
import catchAsync from '../utils/catchAsync';
import { AwsS3 } from '@uptiqai/integrations-sdk';
import { Hono } from 'hono';

const app = new Hono();
// Connect user's AWS S3 credentials
app.post(
    '/storage/aws-s3/connect',
    catchAsync(async c => {
        const { accessKeyId, secretAccessKey, region } = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        // Get existing integration userId if user previously connected
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Initialize AWS S3 client
        const awsS3 = new AwsS3();

        // Store user's credentials
        const result = await awsS3.setUserCredentials({
            userId: user.awsS3IntegrationUserId, // Optional: existing integration user ID
            accessKeyId: accessKeyId, // REQUIRED: User's AWS access key ID
            secretAccessKey: secretAccessKey, // REQUIRED: User's AWS secret access key
            region: region // Optional: per-user AWS region
        });

        // Save the returned userId to your database
        await prisma.user.update({
            where: { id: currentUserId },
            data: { awsS3IntegrationUserId: result.userId }
        });

        return c.json({
            success: true,
            integrationUserId: result.userId
        });
    })
);
```

Step 1 Alternative: Connect User's Google Cloud Storage Credentials (PerUser Config)

```typescript
import { GoogleCloudStorage } from '@uptiqai/integrations-sdk';

app.post(
    '/storage/google-cloud-storage/connect',
    catchAsync(async c => {
        const { credentialsJson } = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Initialize Google Cloud Storage client
        const googleCloudStorage = new GoogleCloudStorage();

        // Store user's credentials
        const result = await googleCloudStorage.setUserCredentials({
            userId: user.googleCloudStorageIntegrationUserId, // Optional: existing integration user ID
            credentialsJson: credentialsJson // REQUIRED: Google service account credentials JSON
        });

        // Save the returned userId to your database
        await prisma.user.update({
            where: { id: currentUserId },
            data: { googleCloudStorageIntegrationUserId: result.userId }
        });

        return c.json({
            success: true,
            integrationUserId: result.userId
        });
    })
);
```

Step 1 Alternative: Connect User's Azure Blob Storage Credentials (PerUser Config)

```typescript
import { AzureBlobStorage } from '@uptiqai/integrations-sdk';

app.post(
    '/storage/azure-blob-storage/connect',
    catchAsync(async c => {
        const { clientId, clientSecret, tenantId } = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Initialize Azure Blob Storage client
        const azureBlobStorage = new AzureBlobStorage();

        // Store user's credentials
        const result = await azureBlobStorage.setUserCredentials({
            userId: user.azureBlobStorageIntegrationUserId, // Optional: existing integration user ID
            clientId: clientId, // REQUIRED: Azure AD application client ID
            clientSecret: clientSecret, // REQUIRED: Azure AD client secret
            tenantId: tenantId // REQUIRED: Azure AD tenant ID
        });

        // Save the returned userId to your database
        await prisma.user.update({
            where: { id: currentUserId },
            data: { azureBlobStorageIntegrationUserId: result.userId }
        });

        return c.json({
            success: true,
            integrationUserId: result.userId
        });
    })
);
```

Step 2: Upload Data (PerUser Config)

```typescript
app.post(
    '/storage/upload-data',
    catchAsync(async c => {
        const { data, destinationKey, contentType } = await c.req.json();
        const currentUserId = c.get('userId'); // From auth middleware

        if (!data) {
            throw new ApiError(400, 'data is required');
        }

        if (!destinationKey) {
            throw new ApiError(400, 'destinationKey is required');
        }

        // Get user's integration userId from database
        const user = await prisma.user.findUnique({
            where: { id: currentUserId }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        const integrationUserId = user.awsS3IntegrationUserId; // Replace with the selected provider's integration user ID field.

        if (!integrationUserId) {
            throw new ApiError(400, 'Please connect your selected storage provider first');
        }

        // Initialize selected storage client
        const storage = getStorage();
        // Upload data with userId (REQUIRED for PerUser config)
        const result = await storage.uploadData({
            userId: integrationUserId, // REQUIRED for PerUser!
            data: data,
            destinationKey: destinationKey,
            contentType: contentType
        });

        return c.json({
            success: true,
            key: result.key
        });
    })
);
```

Step 3: Generate Download Signed URL (PerUser Config)

```typescript
const storage = getStorage();
const integrationUserId = user.awsS3IntegrationUserId; // Replace with the selected provider's integration user ID field.

const result = await storage.generateDownloadSignedUrl({
    userId: integrationUserId, // REQUIRED for PerUser!
    key: 'path/to/file.pdf',
    fileName: 'download-name.pdf'
});
```

## Key Points

- Do not use the generic `Storage` class.
- Choose `AwsS3`, `GoogleCloudStorage`, or `AzureBlobStorage` with `getStorage()` based on `process.env.INFRA_PROVIDER` or the prompt.
- Use signed URLs for client-side uploads and downloads when possible.
- Store the returned storage `key` in the database for later retrieval.
- Store the returned integration `userId` in the database for PerUser config.
