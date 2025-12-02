import json
import base64
import uuid
import boto3
import os
from typing import Dict, Any

s3_client = boto3.client(
    's3',
    endpoint_url='https://storage.yandexcloud.net',
    region_name='ru-central1'
)

BUCKET_NAME = 'poehali-user-files'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Upload image to cloud storage
    Args: event with httpMethod, body containing base64 image
    Returns: HTTP response with image URL
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        image_data = body_data.get('image', '')
        
        if not image_data:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'No image data provided'})
            }
        
        if image_data.startswith('data:image'):
            image_data = image_data.split(',', 1)[1]
        
        image_bytes = base64.b64decode(image_data)
        
        file_extension = 'jpg'
        if body_data.get('type'):
            file_extension = body_data['type'].split('/')[-1]
        
        file_name = f"portfolio/{uuid.uuid4()}.{file_extension}"
        
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=file_name,
            Body=image_bytes,
            ContentType=f'image/{file_extension}'
        )
        
        image_url = f"https://storage.yandexcloud.net/{BUCKET_NAME}/{file_name}"
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'url': image_url}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
