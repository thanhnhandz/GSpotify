import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException
from app.config import settings
import uuid
import os


class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
            region_name=settings.aws_region,
            endpoint_url=settings.s3_endpoint_url
        )
        self.bucket_name = settings.s3_bucket_name

    def upload_file(self, file_content: bytes, file_extension: str, folder: str = "songs") -> str:
        """Upload file to S3 and return the file URL"""
        try:
            file_key = f"{folder}/{uuid.uuid4()}.{file_extension}"
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=file_content,
                ContentType=self._get_content_type(file_extension)
            )
            
            # Return the S3 object URL
            if settings.s3_endpoint_url:
                return f"{settings.s3_endpoint_url}/{self.bucket_name}/{file_key}"
            else:
                return f"https://{self.bucket_name}.s3.{settings.aws_region}.amazonaws.com/{file_key}"
                
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

    def generate_presigned_url(self, file_key: str, expiration: int = 3600) -> str:
        """Generate a presigned URL for streaming the file"""
        try:
            response = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': file_key},
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"Failed to generate presigned URL: {str(e)}")

    def delete_file(self, file_key: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=file_key)
            return True
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

    def _get_content_type(self, file_extension: str) -> str:
        """Get content type based on file extension"""
        content_types = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'flac': 'audio/flac',
            'aac': 'audio/aac',
            'ogg': 'audio/ogg',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif'
        }
        return content_types.get(file_extension.lower(), 'application/octet-stream')

    def extract_key_from_url(self, file_url: str) -> str:
        """Extract S3 key from URL"""
        if settings.s3_endpoint_url:
            return file_url.replace(f"{settings.s3_endpoint_url}/{self.bucket_name}/", "")
        else:
            return file_url.replace(f"https://{self.bucket_name}.s3.{settings.aws_region}.amazonaws.com/", "")


s3_service = S3Service() 