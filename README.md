# 🎓 University of Ghana GPA Calculator

A comprehensive, professional-grade GPA calculator specifically designed for University of Ghana students. Features advanced analytics, smart insights, what-if scenarios, and full FGPA calculation support.

## 🌟 Live Demo

Open `index.html` in any modern browser to start using the calculator instantly - no installation required!

## ✨ Features

### Core Calculations
- **Semester GPA**: Calculate GPA for individual semesters with course-level tracking
- **Cumulative GPA (CGPA)**: Track overall performance across all semesters
- **Final GPA (FGPA)**: Official UG weighted calculation (1:1:2:2 system)
- **Degree Classification**: Automatic class determination (First, Second Upper, Second Lower, Third, Pass)

### Smart Analytics
- **🏆 Best Performance**: Identifies your top-performing courses
- **⚠️ Risk Analysis**: Highlights courses needing attention (E/F grades)
- **🎯 Smart Recommendations**: Personalized retake suggestions with FGPA impact calculations
- **📊 Progress Tracking**: Visual progress bars with boundary alerts

### Advanced Features
- **What-If Scenarios**: Predict future GPA and plan academic goals
- **Retake Planner**: Dedicated tool for planning course retakes with impact analysis
- **Multiple Profiles**: Manage data for multiple students
- **Data Export/Import**: JSON and CSV export capabilities
- **Print-Ready Transcripts**: Professional transcript generation

### User Experience
- **🚀 Onboarding Tour**: 4-step guided tour for first-time users
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **♿ Accessibility**: Full keyboard navigation and screen reader support
- **🎨 Modern UI**: Beautiful blue gradient theme with smooth animations
- **📦 Collapsible Sections**: Compact dashboard for focused workflow

### Special UG Features
- **Transfer Student Support**: Mark levels as N/A for diploma-to-degree students
- **Official UG Grading**: A (4.0) to F (0.0) scale with percentage ranges
- **Level Weighting**: Proper 1:1:2:2 FGPA calculation
- **Course Types**: Support for Core, Elective, and Retake classifications

## 🚀 Quick Start

1. **Download**: Clone or download this repository
2. **Open**: Double-click `index.html` to open in your browser
3. **Create Profile**: Click "Create New Profile" or try the demo
4. **Add Courses**: Enter your course details and calculate!

```bash
# Clone the repository
git clone https://github.com/r-owusu/gpa-calculator.git

# Navigate to folder
cd gpa-calculator

# Open in browser
start index.html  # Windows
open index.html   # macOS
xdg-open index.html  # Linux
```

## 📖 How to Use

### 1. Create a Profile
- Click "Create New Profile" or load the **Demo Profile** to explore
- Enter your name, student number, and programme

### 2. Add Courses
- Navigate to the **Calculator** section
- Select your academic level and semester
- Add courses with: Code, Name, Credits, Grade, Type
- Click "Calculate GPA"

### 3. View Dashboard
- See your current CGPA and FGPA
- Check smart insights: Best course, Risks, Recommendations
- View progress bars with adaptive feedback

### 4. Plan with What-If
- Predict future GPAs with different grade scenarios
- See how retakes will affect your FGPA
- Pin scenarios for comparison

### 5. Generate Transcript
- View complete academic record
- Print or export as CSV
- Professional formatting ready for records

## 🎯 UG Grading System

### Grade Scale
| Letter | Points | Percentage | Description |
|--------|--------|------------|-------------|
| A      | 4.0    | 80-100%    | Outstanding |
| B+     | 3.5    | 75-79%     | Very Good   |
| B      | 3.0    | 70-74%     | Good        |
| C+     | 2.5    | 65-69%     | Fairly Good |
| C      | 2.0    | 60-64%     | Average     |
| D+     | 1.5    | 55-59%     | Below Average |
| D      | 1.0    | 50-54%     | Pass        |
| E      | 0.5    | 45-49%     | Marginal Fail |
| F      | 0.0    | 0-44%      | Fail        |

### FGPA Calculation
```
FGPA = (L100×1 + L200×1 + L300×2 + L400×2) ÷ 6
```

**Example:**
- Level 100 CGPA: 2.75
- Level 200 CGPA: 3.70
- Level 300 CGPA: 3.81
- Level 400 CGPA: 3.68

**FGPA = (2.75×1 + 3.70×1 + 3.81×2 + 3.68×2) ÷ 6 = 3.57**

Result: **Second Class (Upper Division)**

### Degree Classification
| FGPA Range   | Classification |
|--------------|----------------|
| 3.60 - 4.00  | First Class    |
| 3.00 - 3.59  | Second Upper   |
| 2.50 - 2.99  | Second Lower   |
| 2.00 - 2.49  | Third Class    |
| 1.50 - 1.99  | Pass           |
| Below 1.50   | Fail           |

## 💾 Data Storage

All data is stored locally in your browser using `localStorage`:
- ✅ No server required
- ✅ Complete privacy - data never leaves your device
- ✅ Works offline
- ✅ Fast and instant
- ⚠️ Clear browser data = lost data (export regularly!)

**Pro Tip**: Use the Export function to backup your data as JSON!

## 🎨 Technology Stack

- **HTML5**: Semantic structure
- **CSS3**: Modern styling with animations
- **Vanilla JavaScript**: No dependencies, pure ES6+
- **Font Awesome**: Professional icons
- **LocalStorage API**: Client-side data persistence

## ♿ Accessibility

- ✅ Full keyboard navigation (Tab, Arrow keys, Enter, Esc)
- ✅ ARIA labels for screen readers
- ✅ High contrast focus indicators
- ✅ Semantic HTML structure
- ✅ Responsive font sizing
- ✅ Clear visual feedback

**Keyboard Shortcuts:**
- `Tab` - Navigate through elements
- `Arrow Keys` - Move between navigation tabs
- `Enter/Space` - Activate buttons
- `Esc` - Close modals
- `Ctrl/Cmd + K` - Jump to navigation

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- University of Ghana for the official grading system
- UG students for feature requests and testing
- Font Awesome for beautiful icons

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [Your contact information]

## 🔮 Future Enhancements

- [ ] Cloud sync across devices
- [ ] Mobile app (PWA)
- [ ] Dark mode theme
- [ ] Grade prediction using ML
- [ ] Class rank calculator
- [ ] GPA trends and analytics
- [ ] Export to PDF
- [ ] Multi-language support

---

**Made with ❤️ for UG Students**

⭐ Star this repo if you find it helpful!
