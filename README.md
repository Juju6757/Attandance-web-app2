# Student Attendance Web Application - Teacher Portal

A secure, comprehensive web-based student attendance management system built with HTML, CSS, and JavaScript. Features teacher authentication to ensure only authorized users can access and modify attendance data.

## Features

### 🔐 Secure Authentication
- Teacher login system with username/password protection
- Session management with persistent login
- Secure logout functionality
- Demo credentials: `teacher` / `password123`

### 🌓 Dark/Light Mode
- Toggle between dark and light themes
- Smooth transitions and animations
- Theme preference saved automatically
- Professional dark mode with proper contrast

### 🎓 Student Management
- **Smart ID Generation**: Automatic student ID creation using Stream + Year + Roll Number
- **Stream Selection**: Choose from BCA, BBA, or PMIR programs
- **Year Range**: Select admission year from 2024 to 2100
- **Roll Number Input**: Enter roll number (1-999) with auto-formatting
- **ID Format**: Generated as `STREAMYY-RRR` (e.g., BCA024-059)
- Edit existing student information with full ID rebuilding
- Delete students (with attendance data cleanup)
- Search functionality for easy student lookup

### 📅 Attendance Tracking
- Mark attendance for any date
- Present/Absent radio buttons for each student
- Bulk actions: Mark all present or absent
- Date-specific attendance loading and saving

### 📊 Reporting & Analytics
- Generate attendance reports for date ranges
- Individual student or all students reports
- Attendance percentage calculations with color coding
- Export reports as CSV files for external use

### 💾 Data Persistence
- All data stored locally using browser localStorage
- No server required - works entirely offline
- Automatic data saving and loading
- Theme preferences persisted across sessions

## Getting Started

### Local Development
1. Download all files to a folder on your computer
2. Open `index.html` in any modern web browser
3. Start adding students and marking attendance!

### File Structure
```
attendance-app/
├── index.html      # Main HTML structure
├── styles.css      # CSS styling and responsive design
├── script.js       # JavaScript functionality
└── README.md       # This file
```

## How to Use

### Logging In
1. Open the application in your browser
2. Use the demo credentials:
   - Username: `teacher`
   - Password: `password123`
3. Click "Login" to access the teacher portal
4. You'll remain logged in until you click "Logout"

### Switching Themes
1. After logging in, look for the moon/sun icon in the top-right header
2. Click the theme toggle button to switch between light and dark modes
3. Your theme preference is automatically saved
4. The theme applies to all screens including login and main application

### Adding Students
1. After logging in, go to the "Manage Students" tab
2. Enter the student's name
3. Configure the Student ID:
   - **Stream**: Select BCA, BBA, or PMIR
   - **Year**: Choose admission year (2024-2100)
   - **Roll Number**: Enter roll number (1-999)
4. Watch the **Generated Student ID** preview update automatically
5. Click "Add Student" - the system creates the formatted ID
6. The student appears in the list with full details

### Marking Attendance
1. Go to the "Mark Attendance" tab
2. Select the date (defaults to today)
3. Click "Load" to see all students for that date
4. Mark each student as Present or Absent
5. Click "Save Attendance" to store the data

### Viewing Reports
1. Go to the "Reports" tab
2. Select a student (or leave blank for all students)
3. Choose start and end dates
4. Click "Generate Report" to view attendance statistics
5. Click "Export CSV" to download the report

## Student ID Format

The system automatically generates student IDs in the format: `STREAMYYY-RRR`

### Format Breakdown:
- **STREAM**: Program code (BCA, BBA, PMIR)
- **YYY**: Last 3 digits of admission year (024 for 2024)
- **RRR**: Roll number padded to 3 digits (059 for roll 59)

### Examples:
- BCA student, year 2024, roll 59: `BCA024-059`
- BBA student, year 2025, roll 123: `BBA025-123`
- PMIR student, year 2026, roll 5: `PMIR026-005`

### Benefits:
- **Unique Identification**: No duplicate IDs possible
- **Structured Information**: Stream and year embedded in ID
- **Sortable Format**: IDs sort naturally by stream and year
- **Future-Proof**: Supports years through 2100

## Publishing Your Application

### Option 1: GitHub Pages (Free)
1. Create a GitHub account at https://github.com
2. Create a new repository called "attendance-app"
3. Upload your files to the repository
4. Go to Settings > Pages
5. Select "Deploy from a branch" and choose "main"
6. Your app will be available at: `https://yourusername.github.io/attendance-app`

### Option 2: Netlify (Free)
1. Create a Netlify account at https://netlify.com
2. Drag and drop your project folder to the Netlify dashboard
3. Your app will be deployed instantly with a random URL
4. You can customize the domain name in settings

### Option 3: Vercel (Free)
1. Create a Vercel account at https://vercel.com
2. Import your project from GitHub or upload files directly
3. Your app will be deployed automatically
4. Get a free domain like `your-app.vercel.app`

### Option 4: Firebase Hosting (Free)
1. Create a Firebase account at https://firebase.google.com
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Initialize hosting in your project folder
4. Deploy with `firebase deploy`

## Browser Compatibility

This application works in all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Data Storage

- All data is stored locally in your browser
- No data is sent to external servers
- Data persists between browser sessions
- Clear browser data will remove all attendance records

## Customization

### Adding New Features
- Modify `script.js` to add new functionality
- Update `styles.css` for visual changes
- Edit `index.html` for structural modifications

### Styling
- The app uses a modern gradient background
- Responsive design works on mobile and desktop
- Font Awesome icons for enhanced UI

## Security Notes

### Authentication
- Demo credentials are hardcoded for testing purposes
- In production, implement proper server-side authentication
- Sessions are stored in localStorage for convenience
- Change default credentials before deployment

### Data Security
- This is a client-side application
- Data is stored locally and never transmitted
- Authentication is basic and suitable for trusted environments
- For enterprise use, implement server-side authentication and database storage
- All attendance data remains on the local device

## Troubleshooting

### Data Not Saving
- Ensure JavaScript is enabled in your browser
- Check browser console for errors
- Clear browser cache and try again

### Styling Issues
- Ensure all CSS files are properly linked
- Check if Font Awesome CDN is accessible
- Try refreshing the page

### Export Not Working
- Ensure your browser allows file downloads
- Check popup blockers
- Try using a different browser

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the browser console for errors
2. Ensure all files are in the same folder
3. Try the application in a different browser
4. Clear browser cache and localStorage

---

Built with ❤️ using vanilla HTML, CSS, and JavaScript
