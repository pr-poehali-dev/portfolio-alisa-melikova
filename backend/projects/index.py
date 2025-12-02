import json
import os
import psycopg2
from typing import Dict, Any, List

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage portfolio projects (CRUD operations)
    Args: event with httpMethod, body for project data
    Returns: HTTP response with project data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute('''
                SELECT p.id, p.title, p.year, p.description, p.cover_url,
                       COALESCE(json_agg(
                           json_build_object('id', pi.id, 'url', pi.image_url, 'order', pi.sort_order)
                           ORDER BY pi.sort_order
                       ) FILTER (WHERE pi.id IS NOT NULL), '[]') as images
                FROM projects p
                LEFT JOIN project_images pi ON p.id = pi.project_id
                GROUP BY p.id, p.title, p.year, p.description, p.cover_url
                ORDER BY p.year DESC, p.title
            ''')
            
            rows = cur.fetchall()
            projects = []
            for row in rows:
                projects.append({
                    'id': row[0],
                    'title': row[1],
                    'year': row[2],
                    'description': row[3],
                    'cover': row[4] or '',
                    'images': [img['url'] for img in row[5]] if row[5] else []
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(projects),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cur.execute('''
                INSERT INTO projects (id, title, year, description, cover_url)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    year = EXCLUDED.year,
                    description = EXCLUDED.description,
                    cover_url = EXCLUDED.cover_url,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id
            ''', (
                body_data['id'],
                body_data['title'],
                body_data['year'],
                body_data['description'],
                body_data.get('cover', '')
            ))
            
            project_id = cur.fetchone()[0]
            
            if 'images' in body_data and body_data['images']:
                cur.execute('DELETE FROM project_images WHERE project_id = %s', (project_id,))
                
                for idx, img_url in enumerate(body_data['images']):
                    cur.execute('''
                        INSERT INTO project_images (project_id, image_url, sort_order)
                        VALUES (%s, %s, %s)
                    ''', (project_id, img_url, idx))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': project_id, 'success': True}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
            
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        cur.close()
        conn.close()
