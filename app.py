from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import sqlite3
import pandas as pd
import PyPDF2
import io
import json
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Database initialization
def init_db():
    conn = sqlite3.connect('planner.db')
    cursor = conn.cursor()
    
    # Tasks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_id TEXT UNIQUE,
            day_number INTEGER,
            task_text TEXT,
            youtube_link TEXT,
            practice_link TEXT,
            completed BOOLEAN DEFAULT FALSE,
            created_date DATE,
            completed_date DATE,
            estimated_time INTEGER DEFAULT 25
        )
    ''')
    
    # Work sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS work_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            start_time DATETIME,
            end_time DATETIME,
            duration INTEGER,
            session_date DATE,
            session_type TEXT
        )
    ''')
    
    # Daily stats table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE UNIQUE,
            total_work_time INTEGER DEFAULT 0,
            tasks_completed INTEGER DEFAULT 0,
            streak_count INTEGER DEFAULT 0
        )
    ''')
    
    conn.commit()
    conn.close()

def extract_tasks_from_file(file):
    """Extract tasks from various file formats"""
    tasks = []
    filename = secure_filename(file.filename)
    file_extension = filename.rsplit('.', 1)[1].lower()
    
    try:
        if file_extension in ['xlsx', 'xls']:
            df = pd.read_excel(file, header=None)
            for index, row in df.iterrows():
                if index == 0:
                    continue  # Skip header row
                task_text = str(row.iloc[0]) if len(row) > 0 else f"Task {index}"
                youtube_link = str(row.iloc[1]).strip() if len(row) > 1 and pd.notna(row.iloc[1]) else ''
                practice_link = str(row.iloc[2]).strip() if len(row) > 2 and pd.notna(row.iloc[2]) else ''
                tasks.append({'task_text': task_text, 'youtube_link': youtube_link, 'practice_link': practice_link})
                
        elif file_extension == 'csv':
            df = pd.read_csv(file, header=None)
            for index, row in df.iterrows():
                if index == 0:
                    continue  # Skip header row
                task_text = str(row.iloc[0]) if len(row) > 0 else f"Task {index}"
                youtube_link = str(row.iloc[1]).strip() if len(row) > 1 and pd.notna(row.iloc[1]) else ''
                practice_link = str(row.iloc[2]).strip() if len(row) > 2 and pd.notna(row.iloc[2]) else ''
                tasks.append({'task_text': task_text, 'youtube_link': youtube_link, 'practice_link': practice_link})
                
        elif file_extension == 'pdf':
            # PDF files
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            
            # Split by lines and filter out empty lines
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            for line in lines[:50]:
                tasks.append({'task_text': line, 'youtube_link': '', 'practice_link': ''})
            
        elif file_extension == 'txt':
            # Text files
            content = file.read().decode('utf-8')
            lines = [line.strip() for line in content.split('\n') if line.strip()]
            for line in lines[:50]:
                tasks.append({'task_text': line, 'youtube_link': '', 'practice_link': ''})
            
    except Exception as e:
        print(f"Error processing file: {e}")
        return []
    
    return tasks

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    tasks = extract_tasks_from_file(file)
    if not tasks:
        return jsonify({'error': 'Could not extract tasks from file'}), 400
    
    # Clear existing tasks and add new ones
    conn = sqlite3.connect('planner.db')
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM tasks')
    
    today = datetime.now().date()
    for i, task in enumerate(tasks, 1):
        task_id = str(uuid.uuid4())
        cursor.execute('''
            INSERT INTO tasks (task_id, day_number, task_text, youtube_link, practice_link, created_date)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (task_id, i, task['task_text'], task['youtube_link'], task['practice_link'], today))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': f'Successfully uploaded {len(tasks)} tasks',
        'tasks': tasks
    })

@app.route('/api/tasks', methods=['GET', 'POST'])
def handle_tasks():
    if request.method == 'POST':
        # Add new task
        data = request.json
        task_text = data.get('task_text', '').strip()
        youtube_link = data.get('youtube_link', '').strip()
        practice_link = data.get('practice_link', '').strip()
        
        if not task_text:
            return jsonify({'error': 'Task description is required'}), 400
        
        conn = sqlite3.connect('planner.db')
        cursor = conn.cursor()
        
        # Get the next day number
        cursor.execute('SELECT MAX(day_number) FROM tasks')
        result = cursor.fetchone()
        next_day = (result[0] or 0) + 1
        
        # Insert new task
        task_id = str(uuid.uuid4())
        today = datetime.now().date()
        
        cursor.execute('''
            INSERT INTO tasks (task_id, day_number, task_text, youtube_link, practice_link, created_date)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (task_id, next_day, task_text, youtube_link, practice_link, today))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Task added successfully',
            'task': {
                'task_id': task_id,
                'day_number': next_day,
                'task_text': task_text,
                'youtube_link': youtube_link,
                'practice_link': practice_link,
                'completed': False,
                'created_date': today.isoformat(),
                'completed_date': None
            }
        })
    
    else:
        # Get all tasks
        conn = sqlite3.connect('planner.db')
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT task_id, day_number, task_text, youtube_link, practice_link, completed, created_date, completed_date
            FROM tasks
            ORDER BY day_number
        ''')
        
        tasks = []
        for row in cursor.fetchall():
            tasks.append({
                'task_id': row[0],
                'day_number': row[1],
                'task_text': row[2],
                'youtube_link': row[3],
                'practice_link': row[4],
                'completed': bool(row[5]),
                'created_date': row[6],
                'completed_date': row[7]
            })
        
        conn.close()
        return jsonify(tasks)

@app.route('/api/tasks/<task_id>/toggle', methods=['POST'])
def toggle_task(task_id):
    conn = sqlite3.connect('planner.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT completed FROM tasks WHERE task_id = ?', (task_id,))
    result = cursor.fetchone()
    
    if result:
        new_status = not result[0]
        completed_date = datetime.now().date() if new_status else None
        
        cursor.execute('''
            UPDATE tasks 
            SET completed = ?, completed_date = ?
            WHERE task_id = ?
        ''', (new_status, completed_date, task_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'completed': new_status})
    
    conn.close()
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = sqlite3.connect('planner.db')
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM tasks WHERE task_id = ?', (task_id,))
    
    if cursor.rowcount > 0:
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Task deleted successfully'})
    
    conn.close()
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/work-session', methods=['POST'])
def start_work_session():
    data = request.json
    session_type = data.get('type', 'work')  # 'work' or 'pomodoro'
    
    conn = sqlite3.connect('planner.db')
    cursor = conn.cursor()
    
    session_id = str(uuid.uuid4())
    start_time = datetime.now()
    
    cursor.execute('''
        INSERT INTO work_sessions (session_id, start_time, session_date, session_type)
        VALUES (?, ?, ?, ?)
    ''', (session_id, start_time, start_time.date(), session_type))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'session_id': session_id,
        'start_time': start_time.isoformat()
    })

@app.route('/api/work-session/<session_id>/end', methods=['POST'])
def end_work_session(session_id):
    conn = sqlite3.connect('planner.db')
    cursor = conn.cursor()
    
    end_time = datetime.now()
    
    cursor.execute('''
        UPDATE work_sessions 
        SET end_time = ?, duration = ?
        WHERE session_id = ?
    ''', (end_time, (end_time - datetime.fromisoformat(end_time.replace(microsecond=0).isoformat())).seconds, session_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/daily-stats')
def get_daily_stats():
    conn = sqlite3.connect('planner.db')
    cursor = conn.cursor()
    
    today = datetime.now().date()
    
    # Get today's work time
    cursor.execute('''
        SELECT COALESCE(SUM(duration), 0) 
        FROM work_sessions 
        WHERE session_date = ?
    ''', (today,))
    
    total_work_time = cursor.fetchone()[0]
    
    # Get today's completed tasks
    cursor.execute('''
        SELECT COUNT(*) 
        FROM tasks 
        WHERE completed = TRUE AND completed_date = ?
    ''', (today,))
    
    tasks_completed = cursor.fetchone()[0]
    
    # Calculate streak
    cursor.execute('''
        SELECT date, tasks_completed 
        FROM daily_stats 
        ORDER BY date DESC 
        LIMIT 30
    ''')
    
    streak_count = 0
    current_date = today
    
    for row in cursor.fetchall():
        if row[0] == current_date.isoformat() and row[1] > 0:
            streak_count += 1
            current_date -= timedelta(days=1)
        else:
            break
    
    # Update or insert today's stats
    cursor.execute('''
        INSERT OR REPLACE INTO daily_stats (date, total_work_time, tasks_completed, streak_count)
        VALUES (?, ?, ?, ?)
    ''', (today.isoformat(), total_work_time, tasks_completed, streak_count))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'total_work_time': total_work_time,
        'tasks_completed': tasks_completed,
        'streak_count': streak_count,
        'date': today.isoformat()
    })

@app.route('/api/missed-days')
def get_missed_days():
    conn = sqlite3.connect('planner.db')
    cursor = conn.cursor()
    
    # Get all dates with tasks
    cursor.execute('''
        SELECT DISTINCT created_date 
        FROM tasks 
        ORDER BY created_date
    ''')
    
    task_dates = [datetime.fromisoformat(row[0]).date() for row in cursor.fetchall()]
    
    # Get all dates with completed tasks
    cursor.execute('''
        SELECT DISTINCT completed_date 
        FROM tasks 
        WHERE completed_date IS NOT NULL
        ORDER BY completed_date
    ''')
    
    completed_dates = [datetime.fromisoformat(row[0]).date() for row in cursor.fetchall()]
    
    # Find missed days
    missed_dates = []
    for date in task_dates:
        if date not in completed_dates and date < datetime.now().date():
            missed_dates.append(date.isoformat())
    
    # Get tasks for missed days
    missed_tasks = []
    for date in missed_dates:
        cursor.execute('''
            SELECT day_number, task_text 
            FROM tasks 
            WHERE created_date = ? AND completed = FALSE
            ORDER BY day_number
        ''', (date,))
        
        tasks = [{'day_number': row[0], 'task_text': row[1]} for row in cursor.fetchall()]
        if tasks:
            missed_tasks.append({
                'date': date,
                'tasks': tasks
            })
    
    conn.close()
    return jsonify(missed_tasks)

@app.route('/api/tasks/clear', methods=['DELETE'])
def clear_all_tasks():
    conn = sqlite3.connect('planner.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tasks')
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': 'All tasks cleared successfully'})

@app.route('/api/tasks/<task_id>', methods=['PUT'])
def edit_task(task_id):
    data = request.json
    task_text = data.get('task_text', '').strip()
    if not task_text:
        return jsonify({'error': 'Task description is required'}), 400
    conn = sqlite3.connect('planner.db')
    cursor = conn.cursor()
    cursor.execute('UPDATE tasks SET task_text = ? WHERE task_id = ?', (task_text, task_id))
    if cursor.rowcount > 0:
        conn.commit()
        conn.close()
        return jsonify({'success': True, 'message': 'Task updated successfully'})
    conn.close()
    return jsonify({'error': 'Task not found'}), 404

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000) 