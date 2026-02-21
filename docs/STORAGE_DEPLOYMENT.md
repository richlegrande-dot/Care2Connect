# Storage Deployment Configuration Guide

## Option A: Supabase Storage (Recommended)

### Setup Steps:

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and service role key

2. **Configure Storage Buckets**
   ```sql
   -- Run in Supabase SQL Editor
   -- Create audio files bucket (private)
   insert into storage.buckets (id, name, public)
   values ('audio-files', 'audio-files', false);
   
   -- Create QR codes bucket (public)
   insert into storage.buckets (id, name, public)
   values ('qr-codes', 'qr-codes', true);
   ```

3. **Set Up Row Level Security Policies**
   ```sql
   -- Audio files - users can only access their own files
   create policy "Users can upload their own audio files"
   on storage.objects for insert
   with check (
     bucket_id = 'audio-files' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   
   -- QR codes - public read access
   create policy "QR codes are publicly accessible"
   on storage.objects for select
   using (bucket_id = 'qr-codes');
   ```

### Required Environment Variables:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### File Upload Configuration:
```typescript
// backend/src/config/storage.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const uploadAudioFile = async (file: Buffer, fileName: string, userId: string) => {
  const { data, error } = await supabase.storage
    .from('audio-files')
    .upload(`${userId}/${fileName}`, file, {
      contentType: 'audio/mpeg',
      upsert: false
    })
  
  if (error) throw error
  return data
}
```

## Option B: AWS S3 Configuration

### Setup Steps:

1. **Create S3 Buckets**
   ```bash
   # Create audio files bucket (private)
   aws s3 mb s3://careconnect-audio-files --region us-east-1
   
   # Create QR codes bucket (public read)
   aws s3 mb s3://careconnect-qr-codes --region us-east-1
   ```

2. **Configure Bucket Policies**
   - Apply the bucket policy from `aws-s3-bucket-policy.json`
   - Replace `ACCOUNT-ID` with your AWS account ID

3. **Create IAM User and Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:PutObject",
           "s3:GetObject",
           "s3:DeleteObject"
         ],
         "Resource": [
           "arn:aws:s3:::careconnect-audio-files/*",
           "arn:aws:s3:::careconnect-qr-codes/*"
         ]
       }
     ]
   }
   ```

### Required Environment Variables:
```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_AUDIO_BUCKET=careconnect-audio-files
AWS_S3_QR_BUCKET=careconnect-qr-codes
```

### File Upload Configuration:
```typescript
// backend/src/config/s3.ts
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

export const uploadAudioFile = async (file: Buffer, fileName: string, userId: string) => {
  const params = {
    Bucket: process.env.AWS_S3_AUDIO_BUCKET!,
    Key: `${userId}/${fileName}`,
    Body: file,
    ContentType: 'audio/mpeg',
    ServerSideEncryption: 'AES256'
  }
  
  const result = await s3.upload(params).promise()
  return result
}
```

## Storage Service Implementation

### Unified Storage Interface:
```typescript
// backend/src/services/StorageService.ts
export class StorageService {
  static async uploadAudio(file: Buffer, fileName: string, userId: string) {
    if (process.env.SUPABASE_URL) {
      return this.uploadToSupabase(file, fileName, userId)
    } else {
      return this.uploadToS3(file, fileName, userId)
    }
  }
  
  static async generateQRCode(cashtag: string): Promise<string> {
    const qrData = `https://cash.app/${cashtag}`
    const qrCodeBuffer = await QRCode.toBuffer(qrData)
    const fileName = `cashapp-${cashtag}-${Date.now()}.png`
    
    if (process.env.SUPABASE_URL) {
      await this.uploadQRToSupabase(qrCodeBuffer, fileName)
      return `${process.env.SUPABASE_URL}/storage/v1/object/public/qr-codes/${fileName}`
    } else {
      await this.uploadQRToS3(qrCodeBuffer, fileName)
      return `https://${process.env.AWS_S3_QR_BUCKET}.s3.amazonaws.com/${fileName}`
    }
  }
}
```

## File Cleanup Strategy

### Automated Cleanup (Supabase):
```sql
-- Create cleanup function
create or replace function cleanup_old_audio_files()
returns void
language plpgsql
security definer
as $$
begin
  delete from storage.objects
  where bucket_id = 'audio-files'
    and created_at < now() - interval '30 days';
end;
$$;

-- Schedule daily cleanup at 2 AM
select cron.schedule('cleanup-audio', '0 2 * * *', 'select cleanup_old_audio_files();');
```

### Automated Cleanup (AWS S3):
```json
{
  "Rules": [
    {
      "ID": "DeleteIncompleteMultipartUploads",
      "Status": "Enabled",
      "AbortIncompleteMultipartUpload": {
        "DaysAfterInitiation": 1
      }
    },
    {
      "ID": "DeleteOldAudioFiles",
      "Status": "Enabled",
      "Filter": {
        "Prefix": ""
      },
      "Expiration": {
        "Days": 30
      }
    }
  ]
}
```

## Security Considerations

1. **File Type Validation**: Always validate file types before upload
2. **File Size Limits**: Enforce maximum file size (50MB for audio)
3. **Virus Scanning**: Consider integrating virus scanning for uploaded files
4. **Access Control**: Implement proper access controls for file retrieval
5. **Encryption**: Use server-side encryption for sensitive files

## Monitoring and Logging

Track the following metrics:
- Upload success/failure rates
- File sizes and storage usage
- Access patterns and bandwidth usage
- Error rates and response times

Example monitoring query (Supabase):
```sql
select 
  bucket_id,
  count(*) as file_count,
  sum(metadata->>'size')::bigint as total_size,
  avg(metadata->>'size')::bigint as avg_size
from storage.objects 
group by bucket_id;
```