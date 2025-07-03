# Daily Planner - Productivity Hub

A comprehensive Flask-based web application for daily task management, time tracking, and productivity enhancement. Features a modern, responsive interface with advanced timer functionality and intelligent task management.

## 🎨 Color Scheme

The application uses a sophisticated color palette designed for long-term use and reduced eye strain:

- **Electric Blue (#1E90FF)**: Primary attention color for events, time blocks, and reminders
- **Off-White (#FAFAFA)**: Secondary color for task details and schedules
- **Dark Slate (#1C2526)**: Neutral accent for backgrounds and subtle elements

## ✨ Features

### 📁 File Upload & Task Management
- **Multi-format Support**: Upload tasks from Excel (.xlsx, .xls), CSV, PDF, and TXT files
- **Auto-numbering**: Tasks are automatically numbered as Day 1, Day 2, etc.
- **Smart Parsing**: Intelligent extraction of tasks from various file formats
- **Task Tracking**: Mark tasks as complete/incomplete with real-time updates

### ⏱️ Time Management
- **Work Timer**: Start, pause, stop, and reset functionality with session tracking
- **Pomodoro Timer**: 25-minute work sessions with 5-minute breaks
- **Session Recording**: All work sessions are logged and tracked
- **Real-time Updates**: Live timer displays with precise time tracking

### 📊 Productivity Analytics
- **Daily Statistics**: Track total work time, completed tasks, and current streak
- **Streak Tracking**: Monitor consecutive days of task completion
- **Missed Days Detection**: Automatically identify and display missed tasks
- **Progress Visualization**: Clean dashboard with key metrics

### 🔔 Smart Notifications
- **Browser Notifications**: Cross-tab notifications with sound alerts
- **Inactivity Detection**: Monitor user activity and alert for breaks
- **Timer Alerts**: Notifications for Pomodoro session completion
- **Background Alerts**: Notifications even when app is in background

### 🎯 Advanced Features
- **Idle Detection**: Automatic detection of user inactivity
- **Session Persistence**: Timer state saved across browser sessions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with smooth animations

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd pomodoro2
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## 📋 Usage Guide

### Uploading Tasks
1. Click "Choose File" in the Upload Tasks section
2. Select a supported file format (Excel, CSV, PDF, or TXT)
3. Click "Upload Tasks" to process and import your tasks
4. Tasks will be automatically numbered and displayed in the Daily Tasks section

### Using the Work Timer
1. Click "Start" to begin tracking work time
2. Use "Pause" to temporarily stop the timer
3. Click "Stop" to end the session and save the data
4. Use "Reset" to clear the timer display

### Using the Pomodoro Timer
1. Click "Start" to begin a 25-minute work session
2. The timer will automatically switch to a 5-minute break when complete
3. Use pause/stop/reset controls as needed
4. Receive notifications when sessions complete

### Managing Tasks
1. View all uploaded tasks in the Daily Tasks section
2. Check/uncheck tasks to mark them as complete
3. Track your daily progress and streak
4. Review missed days and incomplete tasks

## 🛠️ Technical Details

### Backend (Flask)
- **Framework**: Flask 2.3.3
- **Database**: SQLite (lightweight, no setup required)
- **File Processing**: pandas, openpyxl, PyPDF2
- **API**: RESTful endpoints for all functionality

### Frontend
- **Styling**: Tailwind CSS (CDN)
- **JavaScript**: Vanilla JS with modern ES6+ features
- **Responsive**: Mobile-first design approach
- **Notifications**: Browser Notification API

### Database Schema
- **tasks**: Task storage with completion tracking
- **work_sessions**: Time tracking session data
- **daily_stats**: Aggregated daily statistics

## 📁 Project Structure

```
pomodoro2/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   └── js/
│       └── app.js        # Frontend JavaScript
├── uploads/              # File upload directory (auto-created)
└── planner.db           # SQLite database (auto-created)
```

## 🔧 Configuration

### Environment Variables
- `SECRET_KEY`: Flask secret key (auto-generated)
- `UPLOAD_FOLDER`: File upload directory (default: 'uploads')
- `MAX_CONTENT_LENGTH`: Maximum file size (default: 16MB)

### Customization
- **Timer Durations**: Modify Pomodoro work/break times in `app.js`
- **Idle Threshold**: Adjust inactivity detection time in `app.js`
- **Color Scheme**: Update colors in `index.html` Tailwind config

## 🌐 Deployment

### Local Development
```bash
python app.py
```

### Production Deployment
The application can be deployed to various platforms:

- **Render**: Connect GitHub repository and deploy
- **Railway**: Upload code and deploy automatically
- **Vercel**: Deploy with serverless functions
- **Heroku**: Use Procfile for deployment

### Environment Setup
For production deployment, ensure:
- All dependencies are installed
- Database file has write permissions
- Upload directory is properly configured
- HTTPS is enabled for security

## 🔒 Security Features

- **File Validation**: Secure file upload with type checking
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Proper HTML escaping
- **CSRF Protection**: Flask-WTF integration ready

## 🐛 Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file format is supported
   - Ensure file size is under 16MB
   - Verify file is not corrupted

2. **Timer Not Working**
   - Check browser console for JavaScript errors
   - Ensure notifications are enabled
   - Refresh page if timers become unresponsive

3. **Database Errors**
   - Delete `planner.db` to reset database
   - Check file permissions
   - Ensure sufficient disk space

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📈 Future Enhancements

- [ ] User authentication and accounts
- [ ] Cloud storage integration
- [ ] Advanced analytics and reports
- [ ] Team collaboration features
- [ ] Mobile app development
- [ ] API for third-party integrations
- [ ] Custom task categories and tags
- [ ] Export functionality for reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues, questions, or feature requests:
1. Check the troubleshooting section
2. Review existing issues
3. Create a new issue with detailed information

---

**Built with ❤️ using Flask, Tailwind CSS, and modern web technologies** 