// ===== GLOBAL STATE =====
let currentProfile = null;
let courses = [];
let savedSemesters = [];
let pinnedScenarios = [];

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.5s ease-out reverse';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// ===== DARK MODE TOGGLE =====
function initDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('ugTheme');
    
    // Apply saved theme
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        // Update icon
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        
        // Save preference
        localStorage.setItem('ugTheme', isDark ? 'dark' : 'light');
        
        // Show notification
        showNotification(isDark ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'success');
    });
}

// Initialize dark mode on load
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
});

// ===== SOCIAL SHARE CARD GENERATOR =====
function generateShareCard() {
    if (!currentProfile) {
        showNotification('Please create a profile first!', 'error');
        return;
    }
    
    const { cgpa } = calculateCGPA();
    const classification = getClassification(cgpa);
    
    if (cgpa === 0) {
        showNotification('Add some courses first to generate a share card!', 'error');
        return;
    }
    
    const modal = document.getElementById('shareCardModal');
    const canvas = document.getElementById('shareCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (square for WhatsApp status)
    canvas.width = 1080;
    canvas.height = 1080;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    if (cgpa >= 3.6) {
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#059669');
    } else if (cgpa >= 3.0) {
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#2563eb');
    } else if (cgpa >= 2.5) {
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#7c3aed');
    } else {
        gradient.addColorStop(0, '#f59e0b');
        gradient.addColorStop(1, '#d97706');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);
    
    // Add decorative circles
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(900, 200, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(200, 900, 250, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    // Add white card in center
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    ctx.beginPath();
    ctx.roundRect(120, 200, 840, 680, 30);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    
    // Add trophy emoji/icon
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆', 540, 350);
    
    // Add CGPA
    ctx.font = 'bold 180px Arial';
    ctx.fillStyle = '#1e40af';
    ctx.fillText(cgpa.toFixed(2), 540, 550);
    
    // Add "CGPA" label
    ctx.font = 'bold 50px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('CGPA', 540, 620);
    
    // Add classification
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#374151';
    ctx.fillText(classification, 540, 710);
    
    // Add student name
    ctx.font = '36px Arial';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(currentProfile.name || 'UG Student', 540, 800);
    
    // Add bottom text
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('UNIVERSITY OF GHANA', 540, 1000);
    
    modal.style.display = 'block';
}

function downloadShareCard() {
    const canvas = document.getElementById('shareCanvas');
    const link = document.createElement('a');
    const { cgpa } = calculateCGPA();
    
    link.download = `UG-GPA-${cgpa.toFixed(2)}-Achievement.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showNotification('🎉 Share card downloaded! Post it on your status!', 'success');
}

function copyShareText() {
    const { cgpa } = calculateCGPA();
    const classification = getClassification(cgpa);
    
    const shareText = `🎓 Just calculated my UG GPA!

🏆 CGPA: ${cgpa.toFixed(2)}/4.00
🎯 Classification: ${classification}

#UniversityOfGhana #GPAGoals #AcademicExcellence`;
    
    navigator.clipboard.writeText(shareText).then(() => {
        showNotification('✅ Share text copied! Paste it with your image.', 'success');
    }).catch(() => {
        showNotification('⚠️ Copy failed. Please copy manually.', 'error');
    });
}

// ===== COMMON UG CORE COURSES DATABASE =====
const ugCoreCourses = {
    "Level 100": [
        { code: "UGRC110", name: "Academic Writing I", credits: 3 },
        { code: "UGRC120", name: "Numeracy Skills", credits: 3 },
        { code: "UGRC150", name: "Critical Thinking and Practical Reasoning", credits: 3 },
        { code: "UGRC210", name: "Academic Writing II", credits: 3 }
    ],
    "Level 200": [
        { code: "UGRC210", name: "Academic Writing II", credits: 3 },
        { code: "UGRC220", name: "Introduction to African Studies", credits: 3 },
        { code: "UGRC250", name: "Science and Technology in Our Lives", credits: 3 }
    ]
};

function showQuickAddCoreModal() {
    const modal = document.getElementById('coreCoursesModal');
    const grid = document.getElementById('coreCoursesGrid');
    const level = document.getElementById('academicLevel').value;
    
    if (!level) {
        showNotification('Please select an academic level first!', 'error');
        return;
    }
    
    grid.innerHTML = '';
    
    const courses = ugCoreCourses[level] || [];
    
    if (courses.length === 0) {
        grid.innerHTML = '<p class="info-text">No core courses available for this level.</p>';
    } else {
        courses.forEach((course, index) => {
            const item = document.createElement('div');
            item.className = 'core-course-item';
            item.innerHTML = `
                <input type="checkbox" id="core-${index}" data-code="${course.code}" data-name="${course.name}" data-credits="${course.credits}">
                <div class="core-course-details">
                    <div class="core-course-code">${course.code}</div>
                    <div class="core-course-name">${course.name}</div>
                    <div class="core-course-credits">${course.credits} credits</div>
                </div>
            `;
            
            item.addEventListener('click', function(e) {
                if (e.target.tagName !== 'INPUT') {
                    const checkbox = this.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                this.classList.toggle('selected', this.querySelector('input[type="checkbox"]').checked);
            });
            
            grid.appendChild(item);
        });
    }
    
    modal.style.display = 'block';
}

function addSelectedCoreCourses() {
    const checkboxes = document.querySelectorAll('#coreCoursesGrid input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        showNotification('Please select at least one course!', 'error');
        return;
    }
    
    const tableBody = document.getElementById('courseTableBody');
    
    checkboxes.forEach(checkbox => {
        const code = checkbox.dataset.code;
        const name = checkbox.dataset.name;
        const credits = checkbox.dataset.credits;
        const courseId = Date.now() + Math.random();
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" class="course-code" placeholder="e.g. UGRC120" value="${code}" data-id="${courseId}" list="courseCodeHistory-${courseId}" autocomplete="off"><datalist id="courseCodeHistory-${courseId}"></datalist></td>
            <td><input type="text" class="course-name" placeholder="e.g. Academic Writing I" value="${name}" data-id="${courseId}" list="courseNameHistory-${courseId}" autocomplete="off"><datalist id="courseNameHistory-${courseId}"></datalist></td>
            <td><input type="number" class="course-credits" min="1" max="6" value="${credits}" data-id="${courseId}"><span class="input-hint"></span></td>
            <td>
                <select class="course-grade" data-id="${courseId}">
                    <option value="">Select Grade</option>
                    <option value="A">A (4.0)</option>
                    <option value="B+">B+ (3.5)</option>
                    <option value="B">B (3.0)</option>
                    <option value="C+">C+ (2.5)</option>
                    <option value="C">C (2.0)</option>
                    <option value="D+">D+ (1.5)</option>
                    <option value="D">D (1.0)</option>
                    <option value="E">E (0.5)</option>
                    <option value="F">F (0.0)</option>
                </select>
            </td>
            <td>
                <select class="course-type" data-id="${courseId}">
                    <option value="core">Core</option>
                    <option value="elective">Elective</option>
                    <option value="retake">Retake</option>
                </select>
            </td>
            <td class="grade-points" data-id="${courseId}">0.00</td>
            <td>
                <button class="btn-danger" onclick="removeCourse(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // Add event listeners
        row.querySelector('.course-grade').addEventListener('change', function() {
            updateGradePoints(courseId);
            calculateSemesterGPA();
        });
        
        row.querySelector('.course-credits').addEventListener('input', function() {
            updateGradePoints(courseId);
            calculateSemesterGPA();
        });
        
        // Save to history
        saveCourseToHistory(code, name);
    });
    
    closeModal('coreCoursesModal');
    showNotification(`✅ Added ${checkboxes.length} core course(s)!`, 'success');
}

// ===== COURSE AUTOCOMPLETE FUNCTIONS =====
function saveCourseToHistory(code, name) {
    if (!code) return;
    
    const history = JSON.parse(localStorage.getItem('ugCourseHistory') || '[]');
    
    // Check if course already exists
    const existingIndex = history.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (existingIndex !== -1) {
        // Update name if provided
        if (name) {
            history[existingIndex].name = name;
        }
        history[existingIndex].count++;
        history[existingIndex].lastUsed = Date.now();
    } else {
        history.push({
            code: code.toUpperCase(),
            name: name || '',
            count: 1,
            lastUsed: Date.now()
        });
    }
    
    // Keep only last 100 courses, sorted by usage
    history.sort((a, b) => b.count - a.count);
    const trimmed = history.slice(0, 100);
    
    localStorage.setItem('ugCourseHistory', JSON.stringify(trimmed));
}

function getCourseFromHistory(code) {
    if (!code) return null;
    
    const history = JSON.parse(localStorage.getItem('ugCourseHistory') || '[]');
    return history.find(c => c.code.toUpperCase() === code.toUpperCase());
}

function populateCourseAutocomplete(courseId) {
    const history = JSON.parse(localStorage.getItem('ugCourseHistory') || '[]');
    
    const codeDatalist = document.getElementById(`courseCodeHistory-${courseId}`);
    const nameDatalist = document.getElementById(`courseNameHistory-${courseId}`);
    
    if (!codeDatalist || !nameDatalist) return;
    
    // Sort by most used
    history.sort((a, b) => b.count - a.count);
    
    // Populate code suggestions
    history.forEach(course => {
        const option = document.createElement('option');
        option.value = course.code;
        if (course.name) {
            option.textContent = `${course.code} - ${course.name}`;
        }
        codeDatalist.appendChild(option);
    });
    
    // Populate name suggestions
    history.forEach(course => {
        if (course.name) {
            const option = document.createElement('option');
            option.value = course.name;
            nameDatalist.appendChild(option);
        }
    });
}

// Grade conversion table
const gradeTable = {
    'A': 4.0,
    'B+': 3.5,
    'B': 3.0,
    'C+': 2.5,
    'C': 2.0,
    'D+': 1.5,
    'D': 1.0,
    'E': 0.5,
    'F': 0.0
};

// Degree classification ranges
const degreeClassification = [
    { min: 3.60, max: 4.00, class: 'First Class' },
    { min: 3.00, max: 3.59, class: 'Second Class (Upper Division)' },
    { min: 2.00, max: 2.99, class: 'Second Class (Lower Division)' },
    { min: 1.50, max: 1.99, class: 'Third Class' },
    { min: 1.00, max: 1.49, class: 'Pass' },
    { min: 0.00, max: 0.99, class: 'Fail (No award)' }
];

// ===== HELPER FUNCTIONS (MUST BE BEFORE INITIALIZATION) =====
function calculateCGPA() {
    if (!currentProfile || !currentProfile.semesters || currentProfile.semesters.length === 0) {
        return { cgpa: 0, totalPassed: 0, totalTaken: 0 };
    }

    let totalGPA = 0;
    let totalPassed = 0;
    let totalTaken = 0;

    currentProfile.semesters.forEach(sem => {
        totalGPA += sem.gpa;
        totalTaken += sem.totalCredits || 0;
        totalPassed += (sem.creditsPassed || sem.totalCredits || 0);
    });

    const cgpa = currentProfile.semesters.length > 0 ? totalGPA / currentProfile.semesters.length : 0;
    return { cgpa, totalPassed, totalTaken };
}

function getClassification(gpa) {
    const classification = degreeClassification.find(c => gpa >= c.min && gpa <= c.max);
    return classification ? classification.class : 'No Classification';
}

function checkBoundaryDistance(gpa) {
    const boundaries = [
        { value: 3.60, label: '1st Class' },
        { value: 3.00, label: '2nd Upper' },
        { value: 2.50, label: '2nd Lower' },
        { value: 2.00, label: '3rd Class' },
        { value: 1.50, label: 'Pass' }
    ];

    for (let boundary of boundaries) {
        const distance = Math.abs(gpa - boundary.value);
        if (distance <= 0.15 && gpa < boundary.value) {
            return `${distance.toFixed(2)} to ${boundary.label}`;
        }
    }
    return null;
}

function extractLevelGPAs() {
    if (!currentProfile || !currentProfile.semesters) return [];

    const levelGPAs = { 100: [], 200: [], 300: [], 400: [] };

    currentProfile.semesters.forEach(sem => {
        if (sem.gpa && levelGPAs[sem.level]) {
            levelGPAs[sem.level].push(sem.gpa);
        }
    });

    return [100, 200, 300, 400].map(level => {
        const gpas = levelGPAs[level];
        if (gpas.length === 0) return null;
        return gpas.reduce((a, b) => a + b, 0) / gpas.length;
    });
}

function calculateFGPAFromLevels(levels) {
    const weights = [1, 1, 2, 2];
    let totalWeighted = 0;
    let totalWeight = 0;

    levels.forEach((gpa, index) => {
        if (gpa !== null && !isNaN(gpa)) {
            totalWeighted += gpa * weights[index];
            totalWeight += weights[index];
        }
    });

    return totalWeight > 0 ? totalWeighted / totalWeight : 0;
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadProfiles();
    
    // Check if current semester selection has saved data
    checkAndLoadSemesterData();
    
    updateSemesterHeaderOnLoad();
});

function initializeApp() {
    // Load saved data from localStorage
    const savedData = localStorage.getItem('ugGPAData');
    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.profiles && data.profiles.length > 0) {
            // Load the first profile by default
            loadProfile(data.profiles[0].id);
            // Show dashboard instead of calculator
            switchSection('dashboard');
        }
    } else {
        // No data yet, show calculator
        switchSection('calculator');
    }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchSection(btn.dataset.section));
    });

    // Calculator tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // What-if tabs
    document.querySelectorAll('.whatif-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchWhatIfTab(btn.dataset.whatifTab));
    });

    // Buttons
    document.getElementById('addCourseBtn').addEventListener('click', addCourse);
    document.getElementById('quickAddCoreBtn').addEventListener('click', showQuickAddCoreModal);
    document.getElementById('addSelectedCoresBtn').addEventListener('click', addSelectedCoreCourses);
    document.getElementById('downloadShareCardBtn').addEventListener('click', downloadShareCard);
    document.getElementById('copyShareLinkBtn').addEventListener('click', copyShareText);
    // Auto-calculate on input changes - no manual calculate button needed
    document.getElementById('saveSemesterBtn').addEventListener('click', saveSemester);
    document.getElementById('saveAndNextBtn').addEventListener('click', saveAndProgressToNext);
    document.getElementById('resetBtn').addEventListener('click', resetCourses);
    document.getElementById('newProfileBtn').addEventListener('click', openProfileModal);
    document.getElementById('createProfileBtn').addEventListener('click', openProfileModal);
    document.getElementById('saveProfileBtn').addEventListener('click', saveNewProfile);
    document.getElementById('cancelProfileBtn').addEventListener('click', closeProfileModal);
    document.getElementById('printTranscriptBtn').addEventListener('click', printTranscript);
    document.getElementById('calculateFGPABtn').addEventListener('click', calculateFGPAWithNA);
    document.getElementById('predictGPABtn').addEventListener('click', predictGPA);
    document.getElementById('targetGPABtn').addEventListener('click', calculateTargetGPA);
    document.getElementById('gradeHelpBtn').addEventListener('click', openGradeModal);
    
    // New buttons
    document.getElementById('exportDataBtn').addEventListener('click', exportAllData);
    document.getElementById('importDataBtn').addEventListener('click', () => document.getElementById('importFileInput').click());
    document.getElementById('importFileInput').addEventListener('change', importData);
    document.getElementById('exportPDFBtn').addEventListener('click', exportTranscriptPDF);
    document.getElementById('exportCSVBtn').addEventListener('click', exportTranscriptCSV);
    document.getElementById('pinScenarioBtn').addEventListener('click', pinCurrentScenario);
    
    // Quick scenario buttons
    document.querySelectorAll('.btn-scenario').forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('predictNextGPA').value = this.dataset.gpa;
            predictGPA();
        });
    });

    // Profile selector
    document.getElementById('currentProfile').addEventListener('change', function() {
        if (this.value) {
            loadProfile(this.value);
        }
    });
    
    // Semester transition listeners - CHECK AND LOAD existing data
    document.getElementById('academicLevel').addEventListener('change', function() {
        updateSemesterHeaderOnLoad();
        checkAndLoadSemesterData();
    });
    document.getElementById('semesterNumber').addEventListener('change', function() {
        updateSemesterHeaderOnLoad();
        checkAndLoadSemesterData();
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });

    // Close modals on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// ===== NAVIGATION =====
function switchSection(sectionId) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === sectionId) {
            btn.classList.add('active');
        }
    });

    // Update sections - hide all, then show selected
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
    }

    // Refresh content based on section
    if (sectionId === 'profiles') {
        displayProfiles();
    } else if (sectionId === 'transcript') {
        generateTranscript();
    } else if (sectionId === 'calculator') {
        updateCGPADisplay();
    } else if (sectionId === 'dashboard') {
        updateDashboard();
    } else if (sectionId === 'retake-planner') {
        updateRetakePlanner();
    }
}

function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });

    // Update tab content - hide all, then show selected
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabId}-tab`);
    if (targetTab) {
        targetTab.style.display = 'block';
        targetTab.classList.add('active');
    }

    if (tabId === 'cumulative') {
        updateCGPADisplay();
    }
}

function switchWhatIfTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.whatif-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.whatifTab === tabId) {
            btn.classList.add('active');
        }
    });

    // Update tab content - hide all, then show selected
    document.querySelectorAll('.whatif-tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabId}-whatif-tab`);
    if (targetTab) {
        targetTab.style.display = 'block';
        targetTab.classList.add('active');
    }
}

// ===== COURSE MANAGEMENT =====
function addCourse() {
    const tableBody = document.getElementById('courseTableBody');
    const row = document.createElement('tr');
    const courseId = Date.now();
    
    row.innerHTML = `
        <td><input type="text" class="course-code" placeholder="e.g. UGRC120" data-id="${courseId}" list="courseCodeHistory-${courseId}" autocomplete="off"><datalist id="courseCodeHistory-${courseId}"></datalist></td>
        <td><input type="text" class="course-name" placeholder="e.g. Academic Writing I" data-id="${courseId}" list="courseNameHistory-${courseId}" autocomplete="off"><datalist id="courseNameHistory-${courseId}"></datalist></td>
        <td><input type="number" class="course-credits" min="1" max="6" value="3" data-id="${courseId}"><span class="input-hint"></span></td>
        <td>
            <select class="course-grade" data-id="${courseId}">
                <option value="">Select Grade</option>
                <option value="A">A (4.0)</option>
                <option value="B+">B+ (3.5)</option>
                <option value="B">B (3.0)</option>
                <option value="C+">C+ (2.5)</option>
                <option value="C">C (2.0)</option>
                <option value="D+">D+ (1.5)</option>
                <option value="D">D (1.0)</option>
                <option value="E">E (0.5)</option>
                <option value="F">F (0.0)</option>
            </select>
        </td>
        <td>
            <select class="course-type" data-id="${courseId}">
                <option value="core">Core</option>
                <option value="elective">Elective</option>
                <option value="retake">Retake</option>
            </select>
        </td>
        <td class="grade-points" data-id="${courseId}">0.00</td>
        <td>
            <button class="btn-danger" onclick="removeCourse(this)">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    tableBody.appendChild(row);
    
    // Add credit validation
    const creditsInput = row.querySelector('.course-credits');
    creditsInput.addEventListener('input', function() {
        const value = parseInt(this.value);
        const hint = this.nextElementSibling;
        if (value < 1 || value > 6) {
            this.style.borderColor = 'var(--danger-red)';
            hint.textContent = 'Credits must be 1-6';
            hint.style.color = 'var(--danger-red)';
            hint.style.fontSize = '0.75rem';
        } else {
            this.style.borderColor = '';
            hint.textContent = '';
        }
    });
    
    // Add autocomplete functionality
    const codeInput = row.querySelector('.course-code');
    const nameInput = row.querySelector('.course-name');
    
    // Populate autocomplete from history
    populateCourseAutocomplete(courseId);
    
    // Save to history when user fills in course
    codeInput.addEventListener('blur', function() {
        if (this.value.trim()) {
            saveCourseToHistory(this.value.trim(), nameInput.value.trim());
        }
    });
    
    // Auto-fill course name if code is recognized
    codeInput.addEventListener('input', function() {
        const matchedCourse = getCourseFromHistory(this.value.trim());
        if (matchedCourse && !nameInput.value) {
            nameInput.value = matchedCourse.name;
        }
    });
    
    // Add event listeners for auto-calculation (no manual button needed)
    row.querySelector('.course-grade').addEventListener('change', function() {
        updateGradePoints(courseId);
        calculateSemesterGPA();
        updateSaveAndNextButton();
    });
    
    row.querySelector('.course-credits').addEventListener('input', function() {
        updateGradePoints(courseId);
        calculateSemesterGPA();
        updateSaveAndNextButton();
    });
    
    // Add subtle notification
    if (tableBody.children.length > 1) {
        showNotification('Course added! 📚', 'success');
    }
}

function addDefaultCourse() {
    addCourse();
}

function removeCourse(btn) {
    btn.closest('tr').remove();
    calculateSemesterGPA();
}

function updateGradePoints(courseId) {
    const credits = parseFloat(document.querySelector(`.course-credits[data-id="${courseId}"]`).value) || 0;
    const grade = document.querySelector(`.course-grade[data-id="${courseId}"]`).value;
    const gradePoints = credits * (gradeTable[grade] || 0);
    
    document.querySelector(`.grade-points[data-id="${courseId}"]`).textContent = gradePoints.toFixed(2);
}

function resetCourses() {
    if (confirm('Are you sure you want to reset all courses?')) {
        document.getElementById('courseTableBody').innerHTML = '';
        addDefaultCourse();
        document.getElementById('totalCredits').textContent = '0';
        document.getElementById('creditsPassed').textContent = '0';
        document.getElementById('totalGradePoints').textContent = '0.00';
        document.getElementById('semesterGPA').textContent = '0.00';
    }
}

// ===== SEMESTER TRANSITION FLOW =====
let isTransitioning = false;
let lastSemesterState = { level: '100', semester: '1' };

function handleSemesterTransition() {
    if (isTransitioning) return;
    
    const currentLevel = document.getElementById('academicLevel').value;
    const currentSemester = document.getElementById('semesterNumber').value;
    
    // Check if form has unsaved data
    const hasUnsavedData = checkForUnsavedData();
    
    if (hasUnsavedData) {
        isTransitioning = true;
        
        // Option A: Auto-save with toast notification (Best UX)
        autoSaveSemester(lastSemesterState.level, lastSemesterState.semester, () => {
            // Clear form and update to new semester
            clearSemesterForm();
            updateSemesterHeader(currentLevel, currentSemester);
            displaySemesterHistory();
            
            // Smart defaults: Pre-fill core courses if applicable
            suggestCoreCourses(currentLevel, currentSemester);
            
            isTransitioning = false;
        });
    } else {
        // No unsaved data, just clear and transition
        clearSemesterForm();
        updateSemesterHeader(currentLevel, currentSemester);
    }
    
    // Update last state
    lastSemesterState = { level: currentLevel, semester: currentSemester };
}

function checkForUnsavedData() {
    const rows = document.getElementById('courseTableBody').querySelectorAll('tr');
    
    if (rows.length === 0) return false;
    
    // Check if any course has data entered
    for (let row of rows) {
        const code = row.querySelector('.course-code').value.trim();
        const credits = row.querySelector('.course-credits').value;
        const grade = row.querySelector('.course-grade').value;
        
        if (code || grade) {
            return true;
        }
    }
    
    return false;
}

function autoSaveSemester(level, semester, callback) {
    if (!currentProfile) {
        // No profile, just skip save
        if (callback) callback();
        return;
    }
    
    const rows = document.getElementById('courseTableBody').querySelectorAll('tr');
    const courses = [];
    let hasGrades = false;
    
    rows.forEach(row => {
        const code = row.querySelector('.course-code').value.trim();
        const name = row.querySelector('.course-name').value.trim();
        const credits = parseFloat(row.querySelector('.course-credits').value) || 0;
        const grade = row.querySelector('.course-grade').value;
        
        if (code && credits > 0 && grade) {
            courses.push({ code, name, credits, grade });
            hasGrades = true;
        }
    });
    
    if (!hasGrades || courses.length === 0) {
        // No valid data to save
        if (callback) callback();
        return;
    }
    
    const results = calculateSemesterGPA();
    
    const semesterData = {
        id: `${level}-${semester}-${Date.now()}`,
        level,
        semester,
        courses,
        ...results,
        date: new Date().toISOString()
    };
    
    // Save to current profile
    const data = JSON.parse(localStorage.getItem('ugGPAData') || '{"profiles":[]}');
    const profileIndex = data.profiles.findIndex(p => p.id === currentProfile.id);
    
    if (profileIndex !== -1) {
        if (!data.profiles[profileIndex].semesters) {
            data.profiles[profileIndex].semesters = [];
        }
        
        // Check if semester already exists
        const existingIndex = data.profiles[profileIndex].semesters.findIndex(
            s => s.level === level && s.semester === semester
        );
        
        if (existingIndex !== -1) {
            // Overwrite existing
            data.profiles[profileIndex].semesters[existingIndex] = semesterData;
        } else {
            data.profiles[profileIndex].semesters.push(semesterData);
        }
        
        localStorage.setItem('ugGPAData', JSON.stringify(data));
        currentProfile = data.profiles[profileIndex];
        
        // Show toast notification
        showNotification(`✓ Level ${level} Sem ${semester} auto-saved (GPA: ${results.gpa.toFixed(2)})`, 'success');
        updateCGPADisplay();
    }
    
    if (callback) callback();
}

function clearSemesterForm() {
    document.getElementById('courseTableBody').innerHTML = '';
    addDefaultCourse();
    document.getElementById('totalCredits').textContent = '0';
    document.getElementById('creditsPassed').textContent = '0';
    document.getElementById('totalGradePoints').textContent = '0.00';
    document.getElementById('semesterGPA').textContent = '0.00';
    document.getElementById('insightsPanel').style.display = 'none';
}

// ===== CHECK AND LOAD SEMESTER DATA =====
function checkAndLoadSemesterData() {
    if (!currentProfile || !currentProfile.semesters) {
        // No profile or no saved semesters - clear form
        handleSemesterTransition();
        return;
    }
    
    const selectedLevel = document.getElementById('academicLevel').value;
    const selectedSemester = document.getElementById('semesterNumber').value;
    
    // SEARCH: Look for existing data for this Level + Semester combo
    const existingSemester = currentProfile.semesters.find(
        s => s.level === selectedLevel && s.semester === selectedSemester
    );
    
    if (existingSemester) {
        // BRANCH: Data EXISTS - Switch to EDIT MODE
        loadSemesterDataForEditing(existingSemester);
    } else {
        // BRANCH: No Data - Switch to CREATE MODE
        handleSemesterTransition();
    }
}

function loadSemesterDataForEditing(semesterData) {
    // Clear existing rows
    document.getElementById('courseTableBody').innerHTML = '';
    
    // Populate form with saved courses
    semesterData.courses.forEach(course => {
        addCourseRow(course.code, course.name, course.credits, course.grade);
    });
    
    // Add one empty row for adding new courses
    addDefaultCourse();
    
    // Recalculate GPA to display results
    calculateSemesterGPA();
    
    // Update status to show EDIT mode
    const statusLabel = document.getElementById('semesterStatus');
    if (statusLabel) {
        statusLabel.innerHTML = '<i class="fas fa-pencil-alt"></i> Editing Saved Data';
        statusLabel.className = 'semester-status editing';
    }
    
    showNotification(`📝 Loaded saved data for Level ${semesterData.level} Sem ${semesterData.semester} (GPA: ${semesterData.gpa.toFixed(2)})`, 'info');
}

function addCourseRow(code = '', name = '', credits = '', grade = '') {
    const tbody = document.getElementById('courseTableBody');
    const row = tbody.insertRow();
    
    row.innerHTML = `
        <td><input type="text" class="course-code" value="${code}" placeholder="e.g., COMP120" list="courseCodeList"></td>
        <td><input type="text" class="course-name" value="${name}" placeholder="e.g., Introduction to Computing"></td>
        <td><input type="number" class="course-credits" value="${credits}" min="0" max="6" step="1"></td>
        <td>
            <select class="course-grade" onchange="calculateSemesterGPA()">
                <option value="">-</option>
                <option value="A" ${grade === 'A' ? 'selected' : ''}>A</option>
                <option value="B+" ${grade === 'B+' ? 'selected' : ''}>B+</option>
                <option value="B" ${grade === 'B' ? 'selected' : ''}>B</option>
                <option value="C+" ${grade === 'C+' ? 'selected' : ''}>C+</option>
                <option value="C" ${grade === 'C' ? 'selected' : ''}>C</option>
                <option value="D+" ${grade === 'D+' ? 'selected' : ''}>D+</option>
                <option value="D" ${grade === 'D' ? 'selected' : ''}>D</option>
                <option value="E" ${grade === 'E' ? 'selected' : ''}>E</option>
                <option value="F" ${grade === 'F' ? 'selected' : ''}>F</option>
            </select>
        </td>
        <td><button type="button" class="remove-btn" onclick="removeCourse(this)">Remove</button></td>
    `;
    
    // Add event listeners for auto-calculate only
    // (Autocomplete is handled by datalist in HTML)
    const creditsInput = row.querySelector('.course-credits');
    creditsInput.addEventListener('input', calculateSemesterGPA);
    
    const gradeSelect = row.querySelector('.course-grade');
    gradeSelect.addEventListener('change', calculateSemesterGPA);
}

function updateSemesterHeader(level, semester) {
    // Update visual indicators
    const semesterText = semester === '1' ? '1st Semester' : '2nd Semester';
    
    // Update prominent header
    const headerLabel = document.getElementById('currentSemesterLabel');
    const statusLabel = document.getElementById('semesterStatus');
    
    if (headerLabel) {
        headerLabel.textContent = `Level ${level} - ${semesterText}`;
        
        // Add animation
        headerLabel.parentElement.classList.add('semester-badge-updated');
        setTimeout(() => {
            headerLabel.parentElement.classList.remove('semester-badge-updated');
        }, 1000);
    }
    
    if (statusLabel) {
        statusLabel.innerHTML = '<i class="fas fa-edit"></i> Editing';
        statusLabel.className = 'semester-status editing';
    }
    
    showNotification(`📚 Now entering: Level ${level}, ${semesterText}`, 'info');
}

function suggestCoreCourses(level, semester) {
    // Smart defaults for UG core courses
    const ugCoreSuggestions = {
        '100-1': ['UGRC110', 'UGRC150'],
        '100-2': ['UGRC120', 'UGRC210', 'UGRC220'],
        '200-1': ['UGRC250'],
    };
    
    const suggestionKey = `${level}-${semester}`;
    const suggestedCourses = ugCoreSuggestions[suggestionKey];
    
    if (suggestedCourses && suggestedCourses.length > 0) {
        setTimeout(() => {
            const message = `💡 Suggestion: Level ${level} Sem ${semester} typically includes ${suggestedCourses.join(', ')}. Quick Add Core Courses?`;
            
            if (confirm(message)) {
                showQuickAddCoreModal();
            }
        }, 500);
    }
}

function saveAndProgressToNext() {
    // Save current semester first
    if (!currentProfile) {
        showNotification('Please create or select a profile first!', 'error');
        openProfileModal();
        return;
    }
    
    const currentLevel = document.getElementById('academicLevel').value;
    const currentSemester = document.getElementById('semesterNumber').value;
    
    // Step 1: Save current data
    saveSemester();
    
    // Step 2: Determine next semester
    const nextSemester = getNextSemester(currentLevel, currentSemester);
    
    // Step 3-6: Wait for save to complete, then transition
    setTimeout(() => {
        // Step 3: Update dropdowns to new semester
        document.getElementById('academicLevel').value = nextSemester.level;
        document.getElementById('semesterNumber').value = nextSemester.semester;
        
        // Step 4: Update banner text to match
        updateSemesterHeaderOnLoad();
        
        // Step 5: Clear the table inputs
        clearSemesterForm();
        
        // Step 6: Show visual feedback
        const semesterText = nextSemester.semester === '1' ? '1st Semester' : '2nd Semester';
        showNotification(`📚 Now entering: Level ${nextSemester.level}, ${semesterText}`, 'info');
        
        displaySemesterHistory();
        suggestCoreCourses(nextSemester.level, nextSemester.semester);
        
        // Update button state
        updateSaveAndNextButton();
        
        // Update last state to prevent auto-save trigger
        lastSemesterState = { level: nextSemester.level, semester: nextSemester.semester };
    }, 500);
}

function getNextSemester(currentLevel, currentSemester) {
    const level = parseInt(currentLevel);
    const semester = parseInt(currentSemester);
    
    if (semester === 1) {
        // Move to semester 2 of same level
        return { level: level.toString(), semester: '2' };
    } else {
        // Move to semester 1 of next level
        const nextLevel = level + 100;
        if (nextLevel <= 400) {
            return { level: nextLevel.toString(), semester: '1' };
        } else {
            // Completed all levels
            showNotification('🎓 Congratulations! You\'ve completed all academic levels!', 'success');
            return { level: '400', semester: '2' };
        }
    }
}

function updateSaveAndNextButton() {
    const hasData = checkForUnsavedData();
    const button = document.getElementById('saveAndNextBtn');
    
    if (hasData) {
        button.style.display = 'inline-block';
    } else {
        button.style.display = 'none';
    }
}

// Update the addCourse function to show the Save & Next button when data is entered
const originalAddCourse = addCourse;
addCourse = function() {
    originalAddCourse();
    setTimeout(updateSaveAndNextButton, 100);
};

function updateSemesterHeaderOnLoad() {
    const level = document.getElementById('academicLevel').value;
    const semester = document.getElementById('semesterNumber').value;
    const semesterText = semester === '1' ? '1st Semester' : '2nd Semester';
    
    const headerLabel = document.getElementById('currentSemesterLabel');
    if (headerLabel) {
        headerLabel.textContent = `Level ${level} - ${semesterText}`;
    }
}

function updateSemesterHeaderOnLoad() {
    const level = document.getElementById('academicLevel').value;
    const semester = document.getElementById('semesterNumber').value;
    const semesterText = semester === '1' ? '1st Semester' : '2nd Semester';
    
    const headerLabel = document.getElementById('currentSemesterLabel');
    if (headerLabel) {
        headerLabel.textContent = `Level ${level} - ${semesterText}`;
    }
}

// Update header when dropdowns change (without transition)
function updateHeaderOnly() {
    const level = document.getElementById('academicLevel').value;
    const semester = document.getElementById('semesterNumber').value;
    const semesterText = semester === '1' ? '1st Semester' : '2nd Semester';
    
    const headerLabel = document.getElementById('currentSemesterLabel');
    if (headerLabel) {
        headerLabel.textContent = `Level ${level} - ${semesterText}`;
    }
}

// ===== GPA CALCULATIONS =====
function calculateSemesterGPA() {
    const rows = document.getElementById('courseTableBody').querySelectorAll('tr');
    
    if (rows.length === 0) {
        showNotification('Add some courses first!', 'info');
        return { totalCredits: 0, creditsPassed: 0, totalGradePoints: 0, gpa: 0 };
    }
    let totalCredits = 0;
    let creditsPassed = 0;
    let totalGradePoints = 0;
    
    rows.forEach(row => {
        const credits = parseFloat(row.querySelector('.course-credits').value) || 0;
        const grade = row.querySelector('.course-grade').value;
        const gradeValue = gradeTable[grade] || 0;
        
        if (credits > 0 && grade) {
            totalCredits += credits;
            
            // Only count D and above as passed (grade value >= 1.0)
            if (gradeValue >= 1.0) {
                creditsPassed += credits;
            }
            
            totalGradePoints += credits * gradeValue;
        }
    });
    
    const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    
    // Update display with animation
    document.getElementById('totalCredits').textContent = totalCredits;
    document.getElementById('creditsPassed').textContent = creditsPassed;
    document.getElementById('totalGradePoints').textContent = totalGradePoints.toFixed(2);
    document.getElementById('semesterGPA').textContent = gpa.toFixed(2);
    
    // Add pulse animation to results panel
    const resultsPanel = document.querySelector('.results-panel');
    resultsPanel.classList.remove('updated');
    void resultsPanel.offsetWidth; // Trigger reflow
    resultsPanel.classList.add('updated');
    
    // Collect course data for insights
    const coursesData = [];
    rows.forEach(row => {
        const code = row.querySelector('.course-code').value;
        const name = row.querySelector('.course-name').value;
        const credits = parseFloat(row.querySelector('.course-credits').value) || 0;
        const grade = row.querySelector('.course-grade').value;
        const gradeValue = gradeTable[grade] || 0;
        
        if (code && grade) {
            coursesData.push({ code, name, credits, grade, gradeValue });
        }
    });
    
    // Generate insights
    generateSemesterInsights(coursesData, gpa);
    
    return { totalCredits, creditsPassed, totalGradePoints, gpa };
}

function saveSemester() {
    if (!currentProfile) {
        showNotification('Please create or select a profile first!', 'error');
        openProfileModal();
        return;
    }
    
    const level = document.getElementById('academicLevel').value;
    const semester = document.getElementById('semesterNumber').value;
    const rows = document.getElementById('courseTableBody').querySelectorAll('tr');
    
    if (rows.length === 0) {
        showNotification('Please add at least one course!', 'error');
        return;
    }
    
    const courses = [];
    let hasGrades = false;
    
    rows.forEach(row => {
        const code = row.querySelector('.course-code').value;
        const name = row.querySelector('.course-name').value;
        const credits = parseFloat(row.querySelector('.course-credits').value) || 0;
        const grade = row.querySelector('.course-grade').value;
        
        if (code && credits > 0) {
            courses.push({ code, name, credits, grade });
            if (grade) hasGrades = true;
        }
    });
    
    if (!hasGrades) {
        showNotification('Please select grades for your courses!', 'error');
        return;
    }
    
    const results = calculateSemesterGPA();
    
    const semesterData = {
        id: `${level}-${semester}-${Date.now()}`,
        level,
        semester,
        courses,
        ...results,
        date: new Date().toISOString()
    };
    
    // Save to current profile
    const data = JSON.parse(localStorage.getItem('ugGPAData') || '{"profiles":[]}');
    const profileIndex = data.profiles.findIndex(p => p.id === currentProfile.id);
    
    if (profileIndex !== -1) {
        if (!data.profiles[profileIndex].semesters) {
            data.profiles[profileIndex].semesters = [];
        }
        
        // Check if semester already exists
        const existingIndex = data.profiles[profileIndex].semesters.findIndex(
            s => s.level === level && s.semester === semester
        );
        
        if (existingIndex !== -1) {
            if (confirm('This semester already exists. Do you want to overwrite it?')) {
                data.profiles[profileIndex].semesters[existingIndex] = semesterData;
            } else {
                return;
            }
        } else {
            data.profiles[profileIndex].semesters.push(semesterData);
        }
        
        localStorage.setItem('ugGPAData', JSON.stringify(data));
        currentProfile = data.profiles[profileIndex];
        
        // Visual feedback: Update status badge
        const statusLabel = document.getElementById('semesterStatus');
        if (statusLabel) {
            statusLabel.innerHTML = '<i class="fas fa-check-circle"></i> Saved';
            statusLabel.className = 'semester-status saved';
            
            // Reset to "Editing" after 3 seconds
            setTimeout(() => {
                statusLabel.innerHTML = '<i class="fas fa-edit"></i> Editing';
                statusLabel.className = 'semester-status editing';
            }, 3000);
        }
        
        showNotification('✓ Semester saved successfully! 🎉', 'success');
        updateCGPADisplay();
    }
}

function displaySemesterHistory() {
    if (!currentProfile || !currentProfile.semesters || currentProfile.semesters.length === 0) {
        document.getElementById('semesterHistory').style.display = 'none';
        return;
    }
    
    const historyPanel = document.getElementById('semesterHistory');
    const historyList = document.getElementById('semesterHistoryList');
    
    historyPanel.style.display = 'block';
    historyList.innerHTML = '';
    
    // Sort semesters: NEWEST FIRST (recent activity) for Calculator page
    const sortedSemesters = [...currentProfile.semesters].sort((a, b) => {
        if (a.level !== b.level) return parseInt(b.level) - parseInt(a.level);
        return parseInt(b.semester) - parseInt(a.semester);
    });
    
    // Show last 3 semesters as quick reference
    sortedSemesters.slice(0, 3).forEach(sem => {
        const historyCard = document.createElement('div');
        historyCard.className = 'semester-history-card';
        historyCard.innerHTML = `
            <div class="semester-history-info">
                <strong>Level ${sem.level}, Sem ${sem.semester}</strong>
                <span class="gpa-badge">${sem.gpa.toFixed(2)} GPA</span>
            </div>
            <div class="semester-history-meta">
                ${sem.courses.length} courses · ${sem.totalCredits} credits · ✓ Saved
            </div>
            <button class="btn-sm btn-secondary" onclick="loadSemesterForEdit('${sem.level}', '${sem.semester}')">
                <i class="fas fa-edit"></i> Edit
            </button>
        `;
        historyList.appendChild(historyCard);
    });
}

function loadSemesterForEdit(level, semester) {
    if (!currentProfile || !currentProfile.semesters) return;
    
    const semesterData = currentProfile.semesters.find(
        s => s.level === level && s.semester === semester
    );
    
    if (!semesterData) return;
    
    // Set dropdowns
    document.getElementById('academicLevel').value = level;
    document.getElementById('semesterNumber').value = semester;
    
    // Clear current courses
    document.getElementById('courseTableBody').innerHTML = '';
    
    // Load semester courses
    semesterData.courses.forEach(course => {
        addCourse();
        const lastRow = document.getElementById('courseTableBody').lastElementChild;
        lastRow.querySelector('.course-code').value = course.code;
        lastRow.querySelector('.course-name').value = course.name || '';
        lastRow.querySelector('.course-credits').value = course.credits;
        lastRow.querySelector('.course-grade').value = course.grade;
        
        // Update grade points
        const courseId = lastRow.querySelector('.course-code').dataset.id;
        updateGradePoints(courseId);
    });
    
    calculateSemesterGPA();
    showNotification(`📝 Loaded Level ${level} Sem ${semester} for editing`, 'info');
}

function updateCGPADisplay() {
    const container = document.getElementById('semesterGPAsList');
    container.innerHTML = '';
    
    // Update semester history display
    displaySemesterHistory();
    
    if (!currentProfile || !currentProfile.semesters || currentProfile.semesters.length === 0) {
        container.innerHTML = '<p class="info-text">No semesters saved yet. Add courses and save your semester to calculate CGPA.</p>';
        document.getElementById('cgpaValue').textContent = '0.00';
        return;
    }
    
    // Sort semesters by level and semester number
    const sortedSemesters = [...currentProfile.semesters].sort((a, b) => {
        if (a.level !== b.level) return parseInt(a.level) - parseInt(b.level);
        return parseInt(a.semester) - parseInt(b.semester);
    });
    
    let totalGPA = 0;
    
    sortedSemesters.forEach(sem => {
        const card = document.createElement('div');
        card.className = 'semester-card';
        card.innerHTML = `
            <h4>Level ${sem.level} - Semester ${sem.semester}</h4>
            <p>Credits: ${sem.totalCredits} | GPA: <span class="gpa-value">${sem.gpa.toFixed(2)}</span></p>
            <small>${sem.courses.length} courses</small>
        `;
        container.appendChild(card);
        totalGPA += sem.gpa;
    });
    
    const cgpa = totalGPA / sortedSemesters.length;
    document.getElementById('cgpaValue').textContent = cgpa.toFixed(2);
    
    // Auto-fill FGPA calculator
    autoFillFGPA();
    
    // Update progress bars
    updateProgressBars();
}

function autoFillFGPA() {
    if (!currentProfile || !currentProfile.semesters) return;
    
    const levels = ['100', '200', '300', '400'];
    
    levels.forEach(level => {
        const levelSemesters = currentProfile.semesters.filter(s => s.level === level);
        if (levelSemesters.length > 0) {
            const levelGPA = levelSemesters.reduce((sum, s) => sum + s.gpa, 0) / levelSemesters.length;
            document.getElementById(`level${level}CGPA`).value = levelGPA.toFixed(2);
        }
    });
}

function calculateFGPA() {
    const l100 = parseFloat(document.getElementById('level100CGPA').value) || 0;
    const l200 = parseFloat(document.getElementById('level200CGPA').value) || 0;
    const l300 = parseFloat(document.getElementById('level300CGPA').value) || 0;
    const l400 = parseFloat(document.getElementById('level400CGPA').value) || 0;
    
    // Weights: L100(1), L200(1), L300(2), L400(2), Total = 6
    const fgpa = (l100 * 1 + l200 * 1 + l300 * 2 + l400 * 2) / 6;
    
    document.getElementById('fgpaValue').textContent = fgpa.toFixed(2);
    
    // Determine degree classification
    const classification = degreeClassification.find(c => fgpa >= c.min && fgpa <= c.max);
    document.getElementById('degreeClass').textContent = classification ? classification.class : '-';
    
    if (classification) {
        showNotification(`FGPA Calculated: ${classification.class}! 🎓`, 'success');
    }
}

// ===== PROFILE MANAGEMENT =====
function openProfileModal() {
    document.getElementById('profileModal').classList.add('active');
    document.getElementById('profileName').value = '';
    document.getElementById('profileNumber').value = '';
    document.getElementById('profileProgramme').value = '';
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('active');
}

function saveNewProfile() {
    const name = document.getElementById('profileName').value.trim();
    const number = document.getElementById('profileNumber').value.trim();
    const programme = document.getElementById('profileProgramme').value.trim();
    
    if (!name || !number || !programme) {
        showNotification('Please fill in all fields!', 'error');
        const emptyField = !name ? 'profileName' : !number ? 'profileNumber' : 'profileProgramme';
        document.getElementById(emptyField).classList.add('shake');
        setTimeout(() => document.getElementById(emptyField).classList.remove('shake'), 500);
        return;
    }
    
    const profile = {
        id: Date.now().toString(),
        name,
        number,
        programme,
        semesters: [],
        createdAt: new Date().toISOString()
    };
    
    const data = JSON.parse(localStorage.getItem('ugGPAData') || '{"profiles":[]}');
    data.profiles.push(profile);
    localStorage.setItem('ugGPAData', JSON.stringify(data));
    
    closeProfileModal();
    loadProfiles();
    loadProfile(profile.id);
    
    showNotification('Profile created successfully! 🎓', 'success');
}

function loadProfiles() {
    const data = JSON.parse(localStorage.getItem('ugGPAData') || '{"profiles":[]}');
    const selector = document.getElementById('currentProfile');
    
    selector.innerHTML = '<option value="">Select Profile</option>';
    
    data.profiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile.id;
        option.textContent = `${profile.name} (${profile.number})`;
        selector.appendChild(option);
    });
}

function loadProfile(profileId) {
    const data = JSON.parse(localStorage.getItem('ugGPAData') || '{"profiles":[]}');
    currentProfile = data.profiles.find(p => p.id === profileId);
    
    if (currentProfile) {
        document.getElementById('currentProfile').value = profileId;
        updateCGPADisplay();
        updateDashboard();
        updateRetakePlanner();
    }
}

function displayProfiles() {
    const data = JSON.parse(localStorage.getItem('ugGPAData') || '{"profiles":[]}');
    const container = document.getElementById('profilesList');
    
    container.innerHTML = '';
    
    if (data.profiles.length === 0) {
        container.innerHTML = '<p class="info-text">No profiles yet. Create your first profile to get started!</p>';
        return;
    }
    
    data.profiles.forEach(profile => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        if (currentProfile && currentProfile.id === profile.id) {
            card.classList.add('active');
        }
        
        const semesterCount = profile.semesters ? profile.semesters.length : 0;
        const totalCredits = profile.semesters ? profile.semesters.reduce((sum, s) => sum + s.totalCredits, 0) : 0;
        
        card.innerHTML = `
            <h3>${profile.name}</h3>
            <p><strong>Student Number:</strong> ${profile.number}</p>
            <p><strong>Programme:</strong> ${profile.programme}</p>
            <p><strong>Semesters:</strong> ${semesterCount} | <strong>Credits:</strong> ${totalCredits}</p>
            <div class="profile-actions">
                <button class="btn-primary" onclick="loadProfileAndSwitch('${profile.id}')">
                    <i class="fas fa-check"></i> Select
                </button>
                <button class="btn-danger" onclick="deleteProfile('${profile.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function loadProfileAndSwitch(profileId) {
    loadProfile(profileId);
    switchSection('calculator');
    // Trigger the nav button active state
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === 'calculator') {
            btn.classList.add('active');
        }
    });
}

function deleteProfile(profileId) {
    if (!confirm('Are you sure you want to delete this profile? All data will be lost.')) {
        return;
    }
    
    const data = JSON.parse(localStorage.getItem('ugGPAData') || '{"profiles":[]}');
    data.profiles = data.profiles.filter(p => p.id !== profileId);
    localStorage.setItem('ugGPAData', JSON.stringify(data));
    
    if (currentProfile && currentProfile.id === profileId) {
        currentProfile = null;
    }
    
    loadProfiles();
    displayProfiles();
    showNotification('Profile deleted successfully!', 'info');
}

// ===== TRANSCRIPT GENERATION =====
function generateTranscript() {
    if (!currentProfile) {
        document.getElementById('transcriptContent').innerHTML = 
            '<p class="info-text">Please select a profile to view transcript.</p>';
        return;
    }
    
    // Update student info
    document.getElementById('transcriptName').textContent = currentProfile.name;
    document.getElementById('transcriptNumber').textContent = currentProfile.number;
    document.getElementById('transcriptProgramme').textContent = currentProfile.programme;
    
    // Generate semesters
    const container = document.getElementById('transcriptSemesters');
    container.innerHTML = '';
    
    if (!currentProfile.semesters || currentProfile.semesters.length === 0) {
        container.innerHTML = '<p class="info-text">No semester data available.</p>';
        return;
    }
    
    // Sort semesters
    const sortedSemesters = [...currentProfile.semesters].sort((a, b) => {
        if (a.level !== b.level) return parseInt(a.level) - parseInt(b.level);
        return parseInt(a.semester) - parseInt(b.semester);
    });
    
    let totalCredits = 0;
    let totalCreditsPassed = 0;
    let totalGPA = 0;
    
    sortedSemesters.forEach(sem => {
        const semDiv = document.createElement('div');
        semDiv.className = 'transcript-semester';
        
        let courseTableHTML = `
            <h4>Level ${sem.level} - Semester ${sem.semester}</h4>
            <table class="course-table">
                <thead>
                    <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                        <th>Grade</th>
                        <th>Grade Points</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        sem.courses.forEach(course => {
            const gradePoints = course.credits * (gradeTable[course.grade] || 0);
            courseTableHTML += `
                <tr>
                    <td>${course.code}</td>
                    <td>${course.name}</td>
                    <td>${course.credits}</td>
                    <td>${course.grade}</td>
                    <td>${gradePoints.toFixed(2)}</td>
                </tr>
            `;
        });
        
        courseTableHTML += `
                </tbody>
            </table>
            <p style="margin-top: 1rem;"><strong>Semester GPA: ${sem.gpa.toFixed(2)}</strong></p>
        `;
        
        semDiv.innerHTML = courseTableHTML;
        container.appendChild(semDiv);
        
        totalCredits += sem.totalCredits;
        totalCreditsPassed += sem.creditsPassed;
        totalGPA += sem.gpa;
    });
    
    // Calculate CGPA
    const cgpa = totalGPA / sortedSemesters.length;
    
    // Calculate FGPA
    const levels = ['100', '200', '300', '400'];
    let fgpa = 0;
    let fgpaLevels = {};
    
    levels.forEach(level => {
        const levelSemesters = sortedSemesters.filter(s => s.level === level);
        if (levelSemesters.length > 0) {
            fgpaLevels[level] = levelSemesters.reduce((sum, s) => sum + s.gpa, 0) / levelSemesters.length;
        } else {
            fgpaLevels[level] = 0;
        }
    });
    
    fgpa = (fgpaLevels['100'] * 1 + fgpaLevels['200'] * 1 + fgpaLevels['300'] * 2 + fgpaLevels['400'] * 2) / 6;
    
    // Determine degree classification
    const classification = degreeClassification.find(c => fgpa >= c.min && fgpa <= c.max);
    
    // Update summary
    document.getElementById('transcriptTotalCredits').textContent = totalCredits;
    document.getElementById('transcriptCreditsPassed').textContent = totalCreditsPassed;
    document.getElementById('transcriptCGPA').textContent = cgpa.toFixed(2);
    document.getElementById('transcriptFGPA').textContent = fgpa.toFixed(2);
    document.getElementById('transcriptDegreeClass').textContent = classification ? classification.class : '-';
}

function printTranscript() {
    window.print();
}

// ===== WHAT-IF SCENARIOS =====
function predictGPA() {
    predictGPAWithImpact();
}

function calculateTargetGPA() {
    const currentCGPA = parseFloat(document.getElementById('targetCurrentCGPA').value) || 0;
    const currentCredits = parseFloat(document.getElementById('targetCurrentCredits').value) || 0;
    const targetCGPA = parseFloat(document.getElementById('targetDesiredCGPA').value) || 0;
    const remainingCredits = parseFloat(document.getElementById('targetRemainingCredits').value) || 0;
    
    if (currentCredits === 0 || remainingCredits === 0) {
        alert('Please enter valid credit values!');
        return;
    }
    
    const currentGradePoints = currentCGPA * currentCredits;
    const totalCredits = currentCredits + remainingCredits;
    const targetGradePoints = targetCGPA * totalCredits;
    const requiredGradePoints = targetGradePoints - currentGradePoints;
    const requiredGPA = requiredGradePoints / remainingCredits;
    
    document.getElementById('requiredGPA').textContent = requiredGPA.toFixed(2);
    
    const messageDiv = document.getElementById('targetMessage');
    messageDiv.className = 'info-message';
    
    if (requiredGPA > 4.0) {
        messageDiv.className += ' error';
        messageDiv.textContent = 'Unfortunately, it is not possible to achieve your target GPA with the remaining credits.';
    } else if (requiredGPA >= 3.5) {
        messageDiv.className += ' warning';
        messageDiv.textContent = 'You need to work very hard and achieve high grades in your remaining courses!';
    } else if (requiredGPA >= 0) {
        messageDiv.className += ' success';
        messageDiv.textContent = 'Your target is achievable! Stay focused and maintain consistent performance.';
    } else {
        messageDiv.className += ' success';
        messageDiv.textContent = 'Great news! You have already exceeded your target GPA!';
    }
}

// ===== GRADE REFERENCE MODAL =====
function openGradeModal() {
    document.getElementById('gradeModal').classList.add('active');
}

// ===== UTILITY FUNCTIONS =====
function getDegreeClassification(fgpa) {
    const classification = degreeClassification.find(c => fgpa >= c.min && fgpa <= c.max);
    return classification ? classification.class : 'Not Available';
}

// ===== SEMESTER INSIGHTS & ANALYSIS =====
function generateSemesterInsights() {
    const rows = document.getElementById('courseTableBody').querySelectorAll('tr');
    
    if (rows.length === 0) {
        document.getElementById('insightsPanel').style.display = 'none';
        return;
    }
    
    const coursesData = [];
    rows.forEach(row => {
        const code = row.querySelector('.course-code').value;
        const name = row.querySelector('.course-name').value;
        const credits = parseFloat(row.querySelector('.course-credits').value) || 0;
        const grade = row.querySelector('.course-grade').value;
        const gradeValue = gradeTable[grade] || 0;
        
        if (code && grade) {
            coursesData.push({ code, name, credits, grade, gradeValue });
        }
    });
    
    if (coursesData.length === 0) {
        document.getElementById('insightsPanel').style.display = 'none';
        return;
    }
    
    // Show insights panel
    document.getElementById('insightsPanel').style.display = 'block';
    
    // Find top performers (highest grade values)
    const topCourses = [...coursesData].sort((a, b) => b.gradeValue - a.gradeValue).slice(0, 3);
    const topHTML = topCourses.map(c => `
        <div class="course-insight-item">
            <div>
                <strong>${c.code}</strong>
                <div style="font-size: 0.875rem; color: var(--text-light);">${c.name}</div>
            </div>
            <span class="course-insight-grade high">${c.grade}</span>
        </div>
    `).join('');
    document.getElementById('topCourses').innerHTML = topHTML || '<p>No courses yet</p>';
    
    // Find risk courses (E, F, or low grades)
    const riskCourses = coursesData.filter(c => c.gradeValue <= 1.5);
    const riskHTML = riskCourses.map(c => `
        <div class="course-insight-item">
            <div>
                <strong>${c.code}</strong>
                <div style="font-size: 0.875rem; color: var(--text-light);">${c.name}</div>
            </div>
            <span class="course-insight-grade low">${c.grade}</span>
        </div>
    `).join('');
    document.getElementById('riskCourses').innerHTML = riskHTML || '<p style="color: var(--success-green);">✓ No courses at risk!</p>';
    
    // Generate retake recommendations
    if (riskCourses.length > 0 && currentProfile) {
        const level = document.getElementById('academicLevel').value;
        const levelWeight = level === '300' || level === '400' ? 2 : 1;
        
        const recommendations = riskCourses.map(c => {
            const currentImpact = c.credits * c.gradeValue;
            const potentialImpact = c.credits * 3.5; // Assuming B+ on retake
            const improvement = potentialImpact - currentImpact;
            const fgpaImpact = (improvement * levelWeight) / 6;
            
            return `
                <div class="recommendation-item">
                    <strong>${c.code}</strong>: Retaking this course could improve your FGPA by up to <strong>${fgpaImpact.toFixed(3)}</strong> points.
                    ${levelWeight === 2 ? ' <span style="color: var(--warning-orange);">⚠️ High impact (Level 300/400)</span>' : ''}
                </div>
            `;
        }).join('');
        
        document.getElementById('retakeRecommendations').innerHTML = `
            <h4><i class="fas fa-lightbulb"></i> Retake Recommendations</h4>
            ${recommendations}
        `;
    } else {
        document.getElementById('retakeRecommendations').innerHTML = '';
    }
}

// ===== PROGRESS VISUALIZATION =====
function updateProgressBars() {
    if (!currentProfile || !currentProfile.semesters || currentProfile.semesters.length === 0) {
        return;
    }
    
    // Calculate CGPA
    const totalGPA = currentProfile.semesters.reduce((sum, s) => sum + s.gpa, 0);
    const cgpa = totalGPA / currentProfile.semesters.length;
    
    // Update CGPA progress bar
    const cgpaPercent = (cgpa / 4.0) * 100;
    document.getElementById('cgpaProgressBar').style.width = cgpaPercent + '%';
    document.getElementById('cgpaProgressValue').textContent = cgpa.toFixed(2);
    
    // Determine class
    const classification = degreeClassification.find(c => cgpa >= c.min && cgpa <= c.max);
    document.getElementById('cgpaClassLabel').textContent = classification ? classification.class : '-';
    
    // Update credits progress
    const totalCredits = currentProfile.semesters.reduce((sum, s) => sum + s.totalCredits, 0);
    const creditsPassed = currentProfile.semesters.reduce((sum, s) => sum + s.creditsPassed, 0);
    const assumedRequired = 120; // Typical 4-year degree
    const creditsPercent = Math.min((totalCredits / assumedRequired) * 100, 100);
    
    document.getElementById('creditsProgressBar').style.width = creditsPercent + '%';
    document.getElementById('creditsProgressValue').textContent = `${totalCredits} / ${assumedRequired}`;
    document.getElementById('creditsPassed').textContent = creditsPassed;
    document.getElementById('creditsTotal').textContent = totalCredits;
    
    // Check boundary alerts
    checkBoundaryAlerts(cgpa);
}

function checkBoundaryAlerts(cgpa) {
    const alertDiv = document.getElementById('boundaryAlert');
    
    // Check if near a boundary
    const boundaries = [
        { value: 3.60, name: 'First Class', color: '#fbbf24' },
        { value: 3.00, name: 'Second Class Upper', color: '#10b981' },
        { value: 2.00, name: 'Second Class Lower', color: '#3b82f6' },
        { value: 1.50, name: 'Third Class', color: '#6b7280' }
    ];
    
    for (let boundary of boundaries) {
        const distance = boundary.value - cgpa;
        if (distance > 0 && distance <= 0.15) {
            alertDiv.style.display = 'block';
            alertDiv.innerHTML = `
                <h4><i class="fas fa-exclamation-circle"></i> You're Close!</h4>
                <p>You are only <strong>${distance.toFixed(2)}</strong> points away from <strong>${boundary.name}</strong>!</p>
                <p>Keep pushing for higher grades to reach this milestone.</p>
            `;
            return;
        }
    }
    
    alertDiv.style.display = 'none';
}

// ===== ADVANCED WHAT-IF SCENARIOS =====
function pinCurrentScenario() {
    const currentCGPA = parseFloat(document.getElementById('predictCurrentCGPA').value) || 0;
    const currentCredits = parseFloat(document.getElementById('predictCurrentCredits').value) || 0;
    const nextGPA = parseFloat(document.getElementById('predictNextGPA').value) || 0;
    const nextCredits = parseFloat(document.getElementById('predictNextCredits').value) || 0;
    
    if (!currentCredits || !nextCredits) {
        showNotification('Please fill in all fields first!', 'error');
        return;
    }
    
    const predictedCGPA = ((currentCGPA * currentCredits) + (nextGPA * nextCredits)) / (currentCredits + nextCredits);
    
    const scenario = {
        id: Date.now(),
        name: `Scenario ${pinnedScenarios.length + 1}`,
        currentCGPA,
        currentCredits,
        nextGPA,
        nextCredits,
        predictedCGPA
    };
    
    pinnedScenarios.push(scenario);
    displayPinnedScenarios();
    showNotification('Scenario pinned! 📌', 'success');
}

function displayPinnedScenarios() {
    const container = document.getElementById('scenarioList');
    
    if (pinnedScenarios.length === 0) {
        container.innerHTML = '<p class="info-text">No scenarios pinned yet. Create predictions and pin them to compare!</p>';
        return;
    }
    
    container.innerHTML = pinnedScenarios.map(s => `
        <div class="scenario-card">
            <div class="scenario-info">
                <div class="scenario-name">${s.name}</div>
                <div class="scenario-details">
                    Current: ${s.currentCGPA.toFixed(2)} (${s.currentCredits} credits) 
                    → Next: ${s.nextGPA.toFixed(2)} (${s.nextCredits} credits) 
                    = <strong>${s.predictedCGPA.toFixed(2)}</strong>
                </div>
            </div>
            <button class="btn-danger btn-sm" onclick="removeScenario(${s.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removeScenario(id) {
    pinnedScenarios = pinnedScenarios.filter(s => s.id !== id);
    displayPinnedScenarios();
}

// ===== ENHANCED PREDICTION WITH IMPACT EXPLANATION =====
function predictGPA() {
    const currentCGPA = parseFloat(document.getElementById('predictCurrentCGPA').value) || 0;
    const currentCredits = parseFloat(document.getElementById('predictCurrentCredits').value) || 0;
    const nextGPA = parseFloat(document.getElementById('predictNextGPA').value) || 0;
    const nextCredits = parseFloat(document.getElementById('predictNextCredits').value) || 0;
    
    if (currentCredits === 0 || nextCredits === 0) {
        showNotification('Please enter valid credit values!', 'error');
        return;
    }
    
    const currentGradePoints = currentCGPA * currentCredits;
    const nextGradePoints = nextGPA * nextCredits;
    const totalGradePoints = currentGradePoints + nextGradePoints;
    const totalCredits = currentCredits + nextCredits;
    
    const predictedCGPA = totalGradePoints / totalCredits;
    
    document.getElementById('predictedCGPA').textContent = predictedCGPA.toFixed(2);
    
    // Generate impact explanation
    const impactDiv = document.getElementById('predictionImpact');
    const oldClass = degreeClassification.find(c => currentCGPA >= c.min && currentCGPA <= c.max);
    const newClass = degreeClassification.find(c => predictedCGPA >= c.min && predictedCGPA <= c.max);
    
    const change = predictedCGPA - currentCGPA;
    const changeText = change > 0 ? `increase by ${Math.abs(change).toFixed(2)}` : `decrease by ${Math.abs(change).toFixed(2)}`;
    const impactClass = change > 0 ? 'positive' : change < 0 ? 'negative' : '';
    
    let classChangeText = '';
    if (oldClass && newClass && oldClass.class !== newClass.class) {
        classChangeText = `<br><strong>🎓 Class Change: ${oldClass.class} → ${newClass.class}</strong>`;
    } else if (oldClass) {
        classChangeText = `<br>You will remain in <strong>${oldClass.class}</strong> range.`;
    }
    
    impactDiv.className = `impact-explanation ${impactClass}`;
    impactDiv.innerHTML = `
        <strong>Impact Analysis:</strong><br>
        If you achieve a GPA of <strong>${nextGPA.toFixed(2)}</strong> next semester with <strong>${nextCredits}</strong> credits,
        your CGPA will ${changeText} from <strong>${currentCGPA.toFixed(2)}</strong> to <strong>${predictedCGPA.toFixed(2)}</strong>.
        ${classChangeText}
    `;
}

// ===== DATA EXPORT & IMPORT =====
function exportAllData() {
    const data = localStorage.getItem('ugGPAData');
    if (!data) {
        showNotification('No data to export!', 'error');
        return;
    }
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UG_GPA_Data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully! 📥', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('This will replace all existing data. Are you sure?')) {
                localStorage.setItem('ugGPAData', JSON.stringify(data));
                location.reload();
            }
        } catch (error) {
            showNotification('Invalid file format!', 'error');
        }
    };
    reader.readAsText(file);
}

function exportTranscriptPDF() {
    showNotification('PDF export requires browser print. Use Print button instead.', 'info');
    printTranscript();
}

function exportTranscriptCSV() {
    if (!currentProfile || !currentProfile.semesters || currentProfile.semesters.length === 0) {
        showNotification('No transcript data to export!', 'error');
        return;
    }
    
    let csv = 'Level,Semester,Course Code,Course Name,Credits,Grade,Grade Points\n';
    
    currentProfile.semesters.forEach(sem => {
        sem.courses.forEach(course => {
            const gradePoints = course.credits * (gradeTable[course.grade] || 0);
            csv += `${sem.level},${sem.semester},"${course.code}","${course.name}",${course.credits},${course.grade},${gradePoints.toFixed(2)}\n`;
        });
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transcript_${currentProfile.number}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('CSV exported successfully! 📊', 'success');
}

// ===== UPDATE EXISTING FUNCTIONS =====
// Don't override calculateSemesterGPA - insights are handled separately

// Override updateCGPADisplay to include progress bars
const originalUpdateCGPADisplay = updateCGPADisplay;
updateCGPADisplay = function() {
    originalUpdateCGPADisplay();
    updateProgressBars();
};

// ===== SEMESTER INSIGHTS =====
function generateSemesterInsights(coursesData, gpa) {
    if (!coursesData || coursesData.length === 0) {
        document.getElementById('insightsPanel').style.display = 'none';
        return;
    }
    
    document.getElementById('insightsPanel').style.display = 'block';
    
    // Sort courses by grade points
    const sortedByPerformance = [...coursesData].sort((a, b) => b.gradeValue - a.gradeValue);
    
    // Top performers (A, B+, B)
    const topCourses = sortedByPerformance.filter(c => c.gradeValue >= 3.0).slice(0, 3);
    const topCoursesHTML = topCourses.length > 0 
        ? topCourses.map(c => `
            <div class="course-insight-item">
                <span>${c.code} - ${c.name || 'Course'}</span>
                <span class="course-insight-grade high">${c.grade} (${c.gradeValue})</span>
            </div>
        `).join('')
        : '<p style="color: var(--text-light); font-style: italic;">No courses with B or higher yet.</p>';
    
    document.getElementById('topCourses').innerHTML = topCoursesHTML;
    
    // Risk courses (E, F, D+, D)
    const riskCourses = sortedByPerformance.filter(c => c.gradeValue <= 1.5);
    const riskCoursesHTML = riskCourses.length > 0
        ? riskCourses.map(c => `
            <div class="course-insight-item">
                <span>${c.code} - ${c.name || 'Course'}</span>
                <span class="course-insight-grade low">${c.grade} (${c.gradeValue})</span>
            </div>
        `).join('')
        : '<p style="color: var(--text-light); font-style: italic;">Great! No at-risk courses.</p>';
    
    document.getElementById('riskCourses').innerHTML = riskCoursesHTML;
    
    // Retake recommendations
    const failedCourses = coursesData.filter(c => c.gradeValue < 1.0);
    const retakeBox = document.getElementById('retakeRecommendations');
    
    if (failedCourses.length > 0 && currentProfile?.semesters) {
        const level = document.getElementById('academicLevel').value;
        const levelWeight = level === '300' || level === '400' ? 2 : 1;
        
        retakeBox.style.display = 'block';
        retakeBox.innerHTML = `
            <h4><i class="fas fa-redo"></i> Retake Recommendations</h4>
            ${failedCourses.map(c => {
                const potentialGain = c.credits * (3.0 - c.gradeValue) * levelWeight / 6;
                return `
                    <div class="recommendation-item">
                        <strong>${c.code}</strong>: Retaking this course (Level ${level}) and getting a B 
                        could boost your FGPA by approximately <strong>+${potentialGain.toFixed(3)}</strong> points.
                        ${levelWeight === 2 ? ' <span style="color: var(--warning-orange);">⚡ Double weight impact!</span>' : ''}
                    </div>
                `;
            }).join('')}
        `;
    } else {
        retakeBox.style.display = 'none';
    }
}

// ===== PROGRESS VISUALIZATION =====
function updateProgressBars() {
    if (!currentProfile || !currentProfile.semesters || currentProfile.semesters.length === 0) {
        return;
    }
    
    // Calculate CGPA
    const totalGPA = currentProfile.semesters.reduce((sum, s) => sum + s.gpa, 0);
    const cgpa = totalGPA / currentProfile.semesters.length;
    
    // Update CGPA progress bar
    const cgpaPercent = (cgpa / 4.0) * 100;
    document.getElementById('cgpaProgressBar').style.width = cgpaPercent + '%';
    document.getElementById('cgpaProgressValue').textContent = cgpa.toFixed(2);
    
    // Determine current class
    const currentClass = degreeClassification.find(c => cgpa >= c.min && cgpa <= c.max);
    document.getElementById('cgpaClassLabel').textContent = currentClass ? currentClass.class : '-';
    
    // Update credits progress
    const totalCredits = currentProfile.semesters.reduce((sum, s) => sum + s.totalCredits, 0);
    const totalCreditsPassed = currentProfile.semesters.reduce((sum, s) => sum + s.creditsPassed, 0);
    const assumedTotalRequired = 120; // Typical 4-year program
    const creditsPercent = (totalCredits / assumedTotalRequired) * 100;
    
    document.getElementById('creditsProgressBar').style.width = Math.min(creditsPercent, 100) + '%';
    document.getElementById('creditsProgressValue').textContent = `${totalCredits} / ${assumedTotalRequired}`;
    document.getElementById('creditsPassed').textContent = totalCreditsPassed;
    document.getElementById('creditsTotal').textContent = totalCredits;
    
    // Check for boundary alerts
    checkBoundaryAlerts(cgpa);
}

function checkBoundaryAlerts(cgpa) {
    const alertDiv = document.getElementById('boundaryAlert');
    
    // Check if close to next boundary
    for (let i = degreeClassification.length - 1; i >= 0; i--) {
        const nextClass = degreeClassification[i];
        if (cgpa < nextClass.min) {
            const distance = nextClass.min - cgpa;
            if (distance <= 0.15 && distance > 0) {
                alertDiv.style.display = 'block';
                alertDiv.innerHTML = `
                    <h4><i class="fas fa-flag"></i> You're Close!</h4>
                    <p>You are only <strong>${distance.toFixed(2)}</strong> points away from <strong>${nextClass.class}</strong>!</p>
                    <p>Keep pushing - the next level is within reach. Focus on your upcoming courses.</p>
                `;
                return;
            }
        }
    }
    
    alertDiv.style.display = 'none';
}

// ===== ENHANCED PREDICT WITH IMPACT =====
function predictGPAWithImpact() {
    const currentCGPA = parseFloat(document.getElementById('predictCurrentCGPA').value) || 0;
    const currentCredits = parseFloat(document.getElementById('predictCurrentCredits').value) || 0;
    const nextGPA = parseFloat(document.getElementById('predictNextGPA').value) || 0;
    const nextCredits = parseFloat(document.getElementById('predictNextCredits').value) || 0;
    
    if (currentCredits === 0 || nextCredits === 0) {
        showNotification('Please enter valid credit values!', 'error');
        return;
    }
    
    const currentGradePoints = currentCGPA * currentCredits;
    const nextGradePoints = nextGPA * nextCredits;
    const totalGradePoints = currentGradePoints + nextGradePoints;
    const totalCredits = currentCredits + nextCredits;
    const predictedCGPA = totalGradePoints / totalCredits;
    
    document.getElementById('predictedCGPA').textContent = predictedCGPA.toFixed(2);
    
    // Generate impact explanation
    const impactDiv = document.getElementById('predictionImpact');
    const currentClass = degreeClassification.find(c => currentCGPA >= c.min && currentCGPA <= c.max);
    const predictedClass = degreeClassification.find(c => predictedCGPA >= c.min && predictedCGPA <= c.max);
    
    const change = predictedCGPA - currentCGPA;
    const changeText = change > 0 ? `increases by ${change.toFixed(2)}` : change < 0 ? `decreases by ${Math.abs(change).toFixed(2)}` : 'remains the same';
    
    let impactClass = change > 0 ? 'positive' : change < 0 ? 'negative' : '';
    let classChangeText = '';
    
    if (currentClass && predictedClass) {
        if (currentClass.class !== predictedClass.class) {
            classChangeText = ` This moves you from <strong>${currentClass.class}</strong> to <strong>${predictedClass.class}</strong>! 🎉`;
        } else {
            classChangeText = ` You remain in <strong>${currentClass.class}</strong> range.`;
        }
    }
    
    impactDiv.className = `impact-explanation ${impactClass}`;
    impactDiv.innerHTML = `
        <strong>📊 Impact Analysis:</strong><br>
        If you get <strong>${getGradeFromValue(nextGPA)}</strong> grades next semester (${nextCredits} credits), 
        your CGPA ${changeText} from <strong>${currentCGPA.toFixed(2)}</strong> to <strong>${predictedCGPA.toFixed(2)}</strong>.${classChangeText}
    `;
}

function getGradeFromValue(gpa) {
    if (gpa >= 4.0) return 'A';
    if (gpa >= 3.5) return 'B+';
    if (gpa >= 3.0) return 'B';
    if (gpa >= 2.5) return 'C+';
    if (gpa >= 2.0) return 'C';
    if (gpa >= 1.5) return 'D+';
    return 'D';
}

// ===== SCENARIO MANAGEMENT =====
function pinCurrentScenario() {
    const currentCGPA = parseFloat(document.getElementById('predictCurrentCGPA').value) || 0;
    const currentCredits = parseFloat(document.getElementById('predictCurrentCredits').value) || 0;
    const nextGPA = parseFloat(document.getElementById('predictNextGPA').value) || 0;
    const nextCredits = parseFloat(document.getElementById('predictNextCredits').value) || 0;
    
    if (!currentCGPA || !currentCredits || !nextGPA || !nextCredits) {
        showNotification('Fill in all fields first!', 'error');
        return;
    }
    
    const predictedCGPA = ((currentCGPA * currentCredits) + (nextGPA * nextCredits)) / (currentCredits + nextCredits);
    
    const scenarioName = prompt('Name this scenario:', `Scenario ${pinnedScenarios.length + 1}`);
    if (!scenarioName) return;
    
    const scenario = {
        id: Date.now(),
        name: scenarioName,
        currentCGPA,
        currentCredits,
        nextGPA,
        nextCredits,
        predictedCGPA
    };
    
    pinnedScenarios.push(scenario);
    displayPinnedScenarios();
    showNotification('Scenario pinned! 📌', 'success');
}

function displayPinnedScenarios() {
    const container = document.getElementById('scenarioList');
    
    if (pinnedScenarios.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light); font-style: italic; margin-top: 1rem;">No pinned scenarios yet.</p>';
        return;
    }
    
    container.innerHTML = pinnedScenarios.map(s => `
        <div class="scenario-card">
            <div class="scenario-info">
                <div class="scenario-name">${s.name}</div>
                <div class="scenario-details">
                    Next semester GPA: ${s.nextGPA} → Predicted CGPA: <strong>${s.predictedCGPA.toFixed(2)}</strong>
                </div>
            </div>
            <button class="btn-danger btn-sm" onclick="removeScenario(${s.id})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removeScenario(id) {
    pinnedScenarios = pinnedScenarios.filter(s => s.id !== id);
    displayPinnedScenarios();
}

// ===== DATA EXPORT/IMPORT =====
function exportAllData() {
    const data = localStorage.getItem('ugGPAData');
    if (!data) {
        showNotification('No data to export!', 'error');
        return;
    }
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ug-gpa-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully! 💾', 'success');
}

function importData() {
    const file = document.getElementById('importFileInput').files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.profiles && Array.isArray(data.profiles)) {
                const confirmed = confirm(`Import ${data.profiles.length} profile(s)? This will merge with existing data.`);
                if (confirmed) {
                    const existing = JSON.parse(localStorage.getItem('ugGPAData') || '{"profiles":[]}');
                    existing.profiles = [...existing.profiles, ...data.profiles];
                    localStorage.setItem('ugGPAData', JSON.stringify(existing));
                    loadProfiles();
                    showNotification('Data imported successfully! 📥', 'success');
                }
            } else {
                showNotification('Invalid file format!', 'error');
            }
        } catch (err) {
            showNotification('Error reading file!', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    document.getElementById('importFileInput').value = '';
}

function exportTranscriptPDF() {
    showNotification('Generating PDF... Use Print dialog to save as PDF', 'info');
    setTimeout(() => window.print(), 500);
}

function exportTranscriptCSV() {
    if (!currentProfile || !currentProfile.semesters) {
        showNotification('No transcript data to export!', 'error');
        return;
    }
    
    let csv = 'Level,Semester,Course Code,Course Name,Credits,Grade,Grade Points\n';
    
    currentProfile.semesters.forEach(sem => {
        sem.courses.forEach(course => {
            const gradePoints = course.credits * (gradeTable[course.grade] || 0);
            csv += `${sem.level},${sem.semester},"${course.code}","${course.name}",${course.credits},${course.grade},${gradePoints.toFixed(2)}\n`;
        });
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${currentProfile.name.replace(/\s+/g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Transcript exported to CSV! 📊', 'success');
}



// ===== ONBOARDING TOUR =====
let currentTourStep = 1;

function startTour() {
    document.getElementById('tourOverlay').style.display = 'block';
    currentTourStep = 1;
}

function nextTourStep() {
    document.getElementById(`tour-step-${currentTourStep}`).style.display = 'none';
    currentTourStep++;
    if (currentTourStep <= 5) {
        document.getElementById(`tour-step-${currentTourStep}`).style.display = 'block';
    }
}

function skipTour() {
    document.getElementById('tourOverlay').style.display = 'none';
    localStorage.setItem('tourCompleted', 'true');
}

function finishTour() {
    document.getElementById('tourOverlay').style.display = 'none';
    localStorage.setItem('tourCompleted', 'true');
    showNotification('Tour completed! Start by creating a profile or loading the demo.', 'success');
    switchSection('profiles');
}

// Check if tour should be shown
if (!localStorage.getItem('tourCompleted')) {
    setTimeout(startTour, 1000);
}

// ===== DEMO PROFILE =====
function loadDemoProfile() {
    const demoProfile = {
        name: 'Demo Student',
        id: 'demo-' + Date.now(),
        studentNumber: '10123456',
        programme: 'BSc Computer Science',
        semesters: [
            {
                level: 100,
                semester: 1,
                courses: [
                    { code: 'UGRC110', name: 'Academic Writing I', credits: 3, grade: 'B+', type: 'Core' },
                    { code: 'DCIT101', name: 'Introduction to CS', credits: 3, grade: 'A', type: 'Core' },
                    { code: 'DCIT103', name: 'Office Productivity', credits: 3, grade: 'B', type: 'Core' },
                    { code: 'MATH121', name: 'Algebra & Trigonometry', credits: 3, grade: 'B+', type: 'Core' },
                    { code: 'STAT111', name: 'Introduction to Statistics', credits: 3, grade: 'C+', type: 'Core' }
                ],
                gpa: 3.23
            },
            {
                level: 100,
                semester: 2,
                courses: [
                    { code: 'UGRC120', name: 'Academic Writing II', credits: 3, grade: 'A', type: 'Core' },
                    { code: 'DCIT102', name: 'Computer Hardware', credits: 3, grade: 'B+', type: 'Core' },
                    { code: 'DCIT104', name: 'Programming Fundamentals', credits: 3, grade: 'A', type: 'Core' },
                    { code: 'MATH122', name: 'Calculus I', credits: 3, grade: 'B', type: 'Core' },
                    { code: 'MATH123', name: 'Vectors & Geometry', credits: 3, grade: 'B+', type: 'Elective' }
                ],
                gpa: 3.60
            }
        ],
        pinnedScenarios: []
    };

    const profiles = JSON.parse(localStorage.getItem('gpa_profiles') || '[]');
    
    // Check if demo already exists
    const existingDemo = profiles.find(p => p.name === 'Demo Student');
    if (existingDemo) {
        loadProfile(existingDemo.id);
        showNotification('Demo profile loaded!', 'success');
    } else {
        profiles.push(demoProfile);
        localStorage.setItem('gpa_profiles', JSON.stringify(profiles));
        loadProfile(demoProfile.id);
        showNotification('Demo profile created with sample data!', 'success');
    }
    
    switchSection('dashboard');
    updateDashboard();
}

// ===== CALCULATION INFO MODAL =====
function showCalculationInfo(type) {
    const modal = document.getElementById('calcInfoModal');
    const title = document.getElementById('calcInfoTitle');
    const body = document.getElementById('calcInfoBody');

    if (type === 'fgpa') {
        title.textContent = 'How FGPA Is Calculated';
        body.innerHTML = `
            <h4>Official UG Formula (1:1:2:2 Weighting)</h4>
            <div class="formula-box">
                <strong>FGPA = (L100×1 + L200×1 + L300×2 + L400×2) ÷ 6</strong>
            </div>
            <p>The University of Ghana uses a weighted system that emphasizes upper-level performance:</p>
            <ul>
                <li><strong>Level 100:</strong> Weight = 1</li>
                <li><strong>Level 200:</strong> Weight = 1</li>
                <li><strong>Level 300:</strong> Weight = 2 (double importance)</li>
                <li><strong>Level 400:</strong> Weight = 2 (double importance)</li>
            </ul>
            <h4>Example Calculation</h4>
            <p>If your CGPA for each level is:</p>
            <ul>
                <li>L100: 2.75</li>
                <li>L200: 3.70</li>
                <li>L300: 3.81</li>
                <li>L400: 3.68</li>
            </ul>
            <p><strong>FGPA = (2.75×1 + 3.70×1 + 3.81×2 + 3.68×2) ÷ 6</strong></p>
            <p><strong>FGPA = (2.75 + 3.70 + 7.62 + 7.36) ÷ 6 = 21.43 ÷ 6 = 3.57</strong></p>
            <p>This FGPA of 3.57 would earn a <strong>Second Class (Upper Division)</strong> degree.</p>
        `;
    }

    modal.style.display = 'block';
}

// ===== DASHBOARD UPDATE =====
function updateDashboard() {
    if (!currentProfile) return;

    const { cgpa, totalPassed, totalTaken } = calculateCGPA();
    const classification = getClassification(cgpa);

    // Update CGPA with animated gauge
    updateGPAGauge(cgpa, classification);
    document.getElementById('dash-class').textContent = classification;

    // Calculate boundary distance
    const boundaryInfo = checkBoundaryDistance(cgpa);
    const cgpaBadge = document.getElementById('dash-cgpa-badge');
    if (boundaryInfo) {
        cgpaBadge.textContent = boundaryInfo;
        cgpaBadge.style.display = 'inline-block';
    } else {
        cgpaBadge.style.display = 'none';
    }

    // Update FGPA
    const levels = extractLevelGPAs();
    if (levels.length >= 2) {
        const fgpa = calculateFGPAFromLevels(levels);
        const fgpaClass = getClassification(fgpa);
        document.getElementById('dash-fgpa').textContent = fgpa.toFixed(2);
        document.getElementById('dash-fgpa-class').textContent = fgpaClass;
        
        // Update FGPA icon with dynamic coloring
        updateFGPAIcon(fgpa);

        const fgpaBoundary = checkBoundaryDistance(fgpa);
        const fgpaBadge = document.getElementById('dash-fgpa-badge');
        if (fgpaBoundary) {
            fgpaBadge.textContent = fgpaBoundary;
            fgpaBadge.style.display = 'inline-block';
        } else {
            fgpaBadge.style.display = 'none';
        }
    } else {
        document.getElementById('dash-fgpa').textContent = '-';
        document.getElementById('dash-fgpa-class').textContent = 'Insufficient data';
        
        // Reset FGPA icon to default
        const fgpaIcon = document.getElementById('fgpaIcon');
        if (fgpaIcon) {
            fgpaIcon.className = 'fas fa-graduation-cap fgpa-icon';
        }
    }

    // Update progress bars in dashboard
    const progressContainer = document.getElementById('dash-progress-container');
    progressContainer.innerHTML = generateProgressHTML(cgpa, totalPassed, totalTaken, classification);
}

function updateFGPAIcon(fgpa) {
    const icon = document.getElementById('fgpaIcon');
    if (!icon) return;
    
    // Remove all class modifiers
    icon.className = 'fas fa-graduation-cap fgpa-icon active';
    
    // Add color class based on FGPA tier
    if (fgpa >= 3.6) {
        icon.classList.add('first-class');
    } else if (fgpa >= 3.0) {
        icon.classList.add('second-upper');
    } else if (fgpa >= 2.0) {
        icon.classList.add('second-lower');
    } else {
        icon.classList.add('third-pass');
    }
}

function updateGPAGauge(cgpa, classification) {
    const gaugeFill = document.getElementById('gauge-fill');
    const gaugeText = document.getElementById('gauge-cgpa-text');
    const gaugeLabel = document.getElementById('gauge-cgpa-label');
    
    if (!gaugeFill || !gaugeText || !gaugeLabel) return;
    
    // Calculate percentage (0-100% maps to 0-4.0 GPA)
    const percentage = Math.min((cgpa / 4.0) * 100, 100);
    
    // SVG path arc length is approximately 251.2 for our semi-circle
    const arcLength = 251.2;
    const offset = arcLength - (arcLength * percentage / 100);
    
    // Animate the gauge fill
    gaugeFill.style.strokeDashoffset = offset;
    
    // Update text values
    gaugeText.textContent = cgpa.toFixed(2);
    
    // Update label with classification
    const classShort = classification.replace('Class', '').replace('Division', '').trim();
    gaugeLabel.textContent = classShort;
    
    // Dynamic gauge ring color AND text color (traffic light feedback)
    let gaugeColor, textColor;
    
    if (cgpa >= 3.6) {
        // First Class - Gold/Green
        gaugeColor = '#fbbf24'; // Gold
        textColor = '#16a34a'; // Green
    } else if (cgpa >= 3.0) {
        // Second Upper - Blue
        gaugeColor = '#3b82f6';
        textColor = '#3b82f6';
    } else if (cgpa >= 2.0) {
        // Second Lower/Third - Orange
        gaugeColor = '#f59e0b';
        textColor = '#f59e0b';
    } else {
        // Below 2.0 - Red
        gaugeColor = '#ef4444';
        textColor = '#ef4444';
    }
    
    // Apply dynamic stroke color to gauge ring
    gaugeFill.style.stroke = gaugeColor;
    gaugeText.style.fill = textColor;
}

function updateFGPAIcon(fgpa) {
    const icon = document.getElementById('fgpaIcon');
    if (!icon) return;
    
    // Remove all class modifiers
    icon.className = 'fas fa-graduation-cap fgpa-icon active';
    
    // Add color class based on FGPA tier (traffic light feedback)
    if (fgpa >= 3.6) {
        icon.classList.add('first-class');
    } else if (fgpa >= 3.0) {
        icon.classList.add('second-upper');
    } else if (fgpa >= 2.0) {
        icon.classList.add('second-lower');
    } else {
        icon.classList.add('third-pass');
    }
}

function generateProgressHTML(cgpa, passed, total, classification) {
    const percentage = (cgpa / 4.0) * 100;
    const creditsPercentage = total > 0 ? (passed / total) * 100 : 0;

    return `
        <div class="progress-item">
            <div class="progress-header">
                <span>CGPA Progress (Quality)</span>
                <span class="progress-value">${cgpa.toFixed(2)} / 4.00</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentage}%"></div>
            </div>
            <div class="progress-label">${classification}</div>
        </div>
        <div class="progress-item">
            <div class="progress-header">
                <span>Credits Completed (Quantity)</span>
                <span class="progress-value">${passed} / ${total}</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar credits" style="width: ${creditsPercentage}%"></div>
            </div>
            <div class="progress-label">${passed} Credits Passed | ${total} Credits Taken</div>
        </div>
    `;
}

// ===== RETAKE PLANNER =====
function updateRetakePlanner() {
    if (!currentProfile || !currentProfile.semesters) return;

    const failedCourses = [];
    
    currentProfile.semesters.forEach(sem => {
        sem.courses.forEach(course => {
            if (course.grade === 'E' || course.grade === 'F') {
                failedCourses.push({
                    ...course,
                    level: sem.level,
                    semester: sem.semester
                });
            }
        });
    });

    const table = document.getElementById('retake-table');
    const tbody = document.getElementById('retake-body');
    const summary = document.getElementById('retake-summary');

    if (failedCourses.length === 0) {
        table.style.display = 'none';
        summary.style.display = 'none';
        return;
    }

    table.style.display = 'table';
    tbody.innerHTML = failedCourses.map((course, index) => `
        <tr>
            <td><span class="badge badge-risk">⚠ ${course.code}</span></td>
            <td>${course.name}</td>
            <td>Level ${course.level}</td>
            <td>${course.credits}</td>
            <td><span class="grade-badge grade-${course.grade}">${course.grade}</span></td>
            <td>
                <select id="retake-grade-${index}" class="form-input" onchange="calculateRetakeImpact()">
                    <option value="">Select grade</option>
                    <option value="A">A (4.0)</option>
                    <option value="B+">B+ (3.5)</option>
                    <option value="B">B (3.0)</option>
                    <option value="C+">C+ (2.5)</option>
                    <option value="C">C (2.0)</option>
                    <option value="D+">D+ (1.5)</option>
                    <option value="D">D (1.0)</option>
                </select>
            </td>
            <td id="impact-${index}">-</td>
            <td>
                <button class="btn-sm btn-primary" onclick="applyRetake(${index})">Apply</button>
            </td>
        </tr>
    `).join('');
}

function calculateRetakeImpact() {
    // Calculate and display FGPA impact for each retake selection
    const levels = extractLevelGPAs();
    if (levels.length < 2) return;

    const currentFGPA = calculateFGPAFromLevels(levels);
    
    // Show impact in each row (simplified - would need full recalculation)
    showNotification('Retake impact calculation updated', 'info');
}

// ===== TOGGLE LEVEL N/A =====
function toggleLevelNA(level) {
    const input = document.getElementById(`${level}CGPA`);
    const checkbox = document.getElementById(`${level}-na`);
    
    if (checkbox.checked) {
        input.disabled = true;
        input.value = '';
        input.style.opacity = '0.5';
    } else {
        input.disabled = false;
        input.style.opacity = '1';
    }
}

// ===== FACTORY RESET =====
function executeFactoryReset() {
    const confirmInput = document.getElementById('resetConfirmInput');
    
    if (confirmInput.value.trim() !== 'DELETE ALL') {
        showNotification('Please type "DELETE ALL" to confirm', 'error');
        return;
    }

    if (confirm('Are you absolutely sure? This cannot be undone!')) {
        localStorage.clear();
        showNotification('All data deleted. Refreshing page...', 'success');
        setTimeout(() => location.reload(), 2000);
    }
}

// ===== MODAL CONTROLS =====
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        event.target.classList.remove('active');
    }
};

// ===== ENHANCED FGPA CALCULATION WITH N/A SUPPORT =====
function calculateFGPAWithNA() {
    const levels = [
        { id: 'l100', weight: 1, input: document.getElementById('level100CGPA'), na: document.getElementById('l100-na') },
        { id: 'l200', weight: 1, input: document.getElementById('level200CGPA'), na: document.getElementById('l200-na') },
        { id: 'l300', weight: 2, input: document.getElementById('level300CGPA'), na: document.getElementById('l300-na') },
        { id: 'l400', weight: 2, input: document.getElementById('level400CGPA'), na: document.getElementById('l400-na') }
    ];

    let totalWeightedGPA = 0;
    let totalWeight = 0;
    let validLevels = 0;

    levels.forEach(level => {
        if (level.na && level.na.checked) {
            // Skip this level (transfer/skip)
            return;
        }

        const gpa = parseFloat(level.input.value);
        if (!isNaN(gpa) && gpa >= 0 && gpa <= 4.0) {
            totalWeightedGPA += gpa * level.weight;
            totalWeight += level.weight;
            validLevels++;
        }
    });

    if (validLevels < 2 || totalWeight === 0) {
        showNotification('Please enter at least 2 valid level GPAs', 'error');
        return;
    }

    const fgpa = totalWeightedGPA / totalWeight;
    const classification = getClassification(fgpa);

    document.getElementById('fgpaValue').textContent = fgpa.toFixed(2);
    document.getElementById('degreeClass').textContent = classification;
    
    showNotification(`FGPA calculated: ${fgpa.toFixed(2)} (${classification})`, 'success');
}

// Make functions globally accessible
window.removeCourse = removeCourse;
window.loadProfileAndSwitch = loadProfileAndSwitch;
window.deleteProfile = deleteProfile;
window.removeScenario = removeScenario;
window.showCalculationInfo = showCalculationInfo;
window.updateDashboard = updateDashboard;
window.loadDemoProfile = loadDemoProfile;
window.toggleLevelNA = toggleLevelNA;
window.executeFactoryReset = executeFactoryReset;
window.closeModal = closeModal;
window.openModal = openModal;
window.nextTourStep = nextTourStep;
window.skipTour = skipTour;
window.finishTour = finishTour;
window.updateRetakePlanner = updateRetakePlanner;
window.calculateRetakeImpact = calculateRetakeImpact;

// ===== COLLAPSIBLE SECTIONS =====
function toggleCollapse(elementId) {
    const element = document.getElementById(elementId);
    const parent = element.closest('.collapsible');
    
    if (parent) {
        parent.classList.toggle('collapsed');
    }
}

// ===== ENHANCED DASHBOARD WITH SMART INSIGHTS =====
function updateSmartInsights() {
    if (!currentProfile || !currentProfile.semesters || currentProfile.semesters.length === 0) {
        // Keep the engaging empty state messages from HTML - don't overwrite
        return;
    }

    let allCourses = [];
    currentProfile.semesters.forEach(sem => {
        if (sem.courses) {
            sem.courses.forEach(course => {
                allCourses.push({
                    ...course,
                    level: sem.level,
                    semester: sem.semester
                });
            });
        }
    });

    if (allCourses.length === 0) {
        document.getElementById('bestCourseText').textContent = 'No courses yet';
        document.getElementById('riskCourseText').textContent = 'No courses yet';
        document.getElementById('retakeRecText').textContent = 'Add courses to get recommendations';
        return;
    }

    // Find best course
    allCourses.sort((a, b) => (gradeTable[b.grade] || 0) - (gradeTable[a.grade] || 0));
    const bestCourse = allCourses[0];
    document.getElementById('bestCourseText').textContent = 
        `${bestCourse.code} - ${bestCourse.name} (${bestCourse.grade})`;

    // Find biggest risk
    const riskCourses = allCourses.filter(c => c.grade === 'E' || c.grade === 'F' || c.grade === 'D');
    if (riskCourses.length > 0) {
        const worstCourse = riskCourses[riskCourses.length - 1];
        document.getElementById('riskCourseText').innerHTML = 
            `<span class="highlight-risk">${worstCourse.code} - ${worstCourse.name} (${worstCourse.grade})</span>`;
        
        // Trigger risk toast notification
        checkAndTriggerRiskNotification(worstCourse);
    } else {
        document.getElementById('riskCourseText').textContent = 'All courses performing well! ✓';
    }

    // Recommended action
    const failedCourses = allCourses.filter(c => c.grade === 'E' || c.grade === 'F');
    if (failedCourses.length > 0) {
        document.getElementById('retakeRecText').innerHTML = 
            `Retake ${failedCourses.length} failed course${failedCourses.length > 1 ? 's' : ''} 
            (${failedCourses.map(c => c.code).join(', ')})`;
    } else {
        const { cgpa } = calculateCGPA();
        const nextBoundary = getNextBoundary(cgpa);
        if (nextBoundary) {
            document.getElementById('retakeRecText').textContent = 
                `Maintain current performance to reach ${nextBoundary.label}`;
        } else {
            document.getElementById('retakeRecText').textContent = 
                'Excellent! Keep up the great work! 🎉';
        }
    }
    
    // Make cards clickable for detailed insights
    addInsightCardClickHandlers(allCourses, bestCourse, riskCourses, failedCourses);
    
    // Check for achievement milestones
    checkAchievements(allCourses);
    
    // Add dynamic progress bar overlays
    addDynamicProgressOverlays();
}

function getNextBoundary(gpa) {
    const boundaries = [
        { value: 3.60, label: 'First Class' },
        { value: 3.00, label: 'Second Upper' },
        { value: 2.50, label: 'Second Lower' },
        { value: 2.00, label: 'Third Class' },
        { value: 1.50, label: 'Pass' }
    ];

    for (let boundary of boundaries) {
        if (gpa < boundary.value) {
            return boundary;
        }
    }
    return null;
}

// ===== EXPANDABLE INSIGHT CARDS WITH MODALS =====
function addInsightCardClickHandlers(allCourses, bestCourse, riskCourses, failedCourses) {
    // Best course card - show top performers
    const bestCard = document.querySelector('.smart-card.best-course');
    if (bestCard) {
        bestCard.onclick = () => showDetailedInsight('best', allCourses);
    }
    
    // Risk course card - show all at-risk courses
    const riskCard = document.querySelector('.smart-card.risk-course');
    if (riskCard) {
        riskCard.onclick = () => showDetailedInsight('risk', riskCourses);
    }
    
    // Retake recommendation card - show impact analysis
    const retakeCard = document.querySelector('.smart-card.retake-rec');
    if (retakeCard) {
        retakeCard.onclick = () => showDetailedInsight('retake', failedCourses);
    }
}

function showDetailedInsight(type, courses) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    let content = '';
    
    if (type === 'best') {
        const top5 = courses.slice(0, 5);
        content = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🏆 Top Performing Courses</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <p class="info-text">Your strongest performances - keep up this excellent work!</p>
                    <table class="grade-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Course</th>
                                <th>Grade</th>
                                <th>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${top5.map((c, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${c.code} - ${c.name}</td>
                                    <td><strong>${c.grade}</strong></td>
                                    <td>${gradeTable[c.grade]}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } else if (type === 'risk') {
        const { cgpa } = calculateCGPA();
        content = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚠️ At-Risk Courses</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <p class="info-text">These courses need attention. Consider retaking or seeking help.</p>
                    ${courses.length > 0 ? `
                        <table class="grade-table">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Current Grade</th>
                                    <th>Target</th>
                                    <th>Impact</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${courses.map(c => {
                                    const targetGrade = 'B';
                                    const impact = ((gradeTable[targetGrade] - gradeTable[c.grade]) * c.credits / 100).toFixed(2);
                                    return `
                                        <tr>
                                            <td>${c.code}</td>
                                            <td><span class="highlight-risk">${c.grade}</span></td>
                                            <td>${targetGrade}</td>
                                            <td>+${impact} CGPA</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    ` : '<p>No at-risk courses found! 🎉</p>'}
                </div>
            </div>
        `;
    } else if (type === 'retake') {
        content = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎯 Retake Impact Analysis</h3>
                    <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    <p class="info-text">See how retaking each course affects your GPA:</p>
                    ${courses.length > 0 ? `
                        <table class="grade-table">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Current</th>
                                    <th>If Retake (B)</th>
                                    <th>CGPA Boost</th>
                                    <th>Priority</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${courses.map(c => {
                                    const boost = ((gradeTable['B'] - gradeTable[c.grade]) * c.credits / 100).toFixed(2);
                                    const priority = parseFloat(boost) > 0.1 ? '🔥 High' : '⭐ Medium';
                                    return `
                                        <tr>
                                            <td>${c.code}</td>
                                            <td>${c.grade}</td>
                                            <td>B (3.0)</td>
                                            <td>+${boost}</td>
                                            <td>${priority}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                        <div class="info-message success" style="margin-top: 20px;">
                            <strong>Tip:</strong> Focus on high-priority courses first for maximum GPA improvement!
                        </div>
                    ` : '<p>No retakes needed - you\'re doing great! 🎉</p>'}
                </div>
            </div>
        `;
    }
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
}

// ===== ACHIEVEMENT & MILESTONE SYSTEM =====
function checkAchievements(courses) {
    const { cgpa } = calculateCGPA();
    const achievements = JSON.parse(localStorage.getItem('ugAchievements') || '[]');
    
    // First A achievement
    if (courses.some(c => c.grade === 'A') && !achievements.includes('first-a')) {
        triggerMilestone('🌟 First A Grade!', 'You earned your first A! Excellence unlocked!');
        achievements.push('first-a');
    }
    
    // First Class achievement
    if (cgpa >= 3.6 && !achievements.includes('first-class')) {
        triggerMilestone('🏆 First Class Status!', `CGPA: ${cgpa.toFixed(2)} - Outstanding achievement!`);
        achievements.push('first-class');
    }
    
    // Perfect semester (all A's)
    const lastSemester = currentProfile.semesters[currentProfile.semesters.length - 1];
    if (lastSemester && lastSemester.courses.every(c => c.grade === 'A') && 
        !achievements.includes(`perfect-${lastSemester.level}-${lastSemester.semester}`)) {
        triggerMilestone('💯 Perfect Semester!', 'All A\'s - Incredible performance!');
        achievements.push(`perfect-${lastSemester.level}-${lastSemester.semester}`);
    }
    
    // 10 courses milestone
    if (courses.length >= 10 && !achievements.includes('10-courses')) {
        triggerMilestone('📚 10 Courses Completed!', 'You\'re making great progress!');
        achievements.push('10-courses');
    }
    
    // 20 courses milestone
    if (courses.length >= 20 && !achievements.includes('20-courses')) {
        triggerMilestone('🎓 20 Courses Completed!', 'Halfway to graduation!');
        achievements.push('20-courses');
    }
    
    localStorage.setItem('ugAchievements', JSON.stringify(achievements));
}

function triggerMilestone(title, message) {
    const overlay = document.createElement('div');
    overlay.className = 'milestone-overlay';
    overlay.innerHTML = `
        <div class="milestone-icon">🎉</div>
        <h2>${title}</h2>
        <p>${message}</p>
        <button class="close-milestone" onclick="this.closest('.milestone-overlay').remove()">
            Awesome!
        </button>
    `;
    
    document.body.appendChild(overlay);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        overlay.remove();
    }, 5000);
    
    // Also show toast notification
    showNotification(`🎉 ${title}`, 'success');
}

// ===== RISK NOTIFICATION SYSTEM =====
function checkAndTriggerRiskNotification(riskCourse) {
    const notifiedRisks = JSON.parse(localStorage.getItem('ugNotifiedRisks') || '[]');
    const riskKey = `${riskCourse.level}-${riskCourse.semester}-${riskCourse.code}`;
    
    if (!notifiedRisks.includes(riskKey)) {
        showNotification(
            `⚠️ Risk Detected: ${riskCourse.code} (${riskCourse.grade}) in ${riskCourse.level}`,
            'error'
        );
        notifiedRisks.push(riskKey);
        localStorage.setItem('ugNotifiedRisks', JSON.stringify(notifiedRisks));
    }
}

// ===== DYNAMIC PROGRESS BAR OVERLAYS =====
function addDynamicProgressOverlays() {
    const progressContainers = document.querySelectorAll('.progress-bar-container');
    const previousCGPA = parseFloat(localStorage.getItem('ugPreviousCGPA') || '0');
    const { cgpa } = calculateCGPA();
    
    progressContainers.forEach(container => {
        // Remove existing overlays
        container.classList.remove('trending-up', 'trending-down', 'at-risk');
        
        // Add dynamic classes based on performance
        if (cgpa > previousCGPA + 0.05) {
            container.classList.add('trending-up');
        } else if (cgpa < previousCGPA - 0.05) {
            container.classList.add('trending-down');
        }
        
        if (cgpa < 2.0) {
            container.classList.add('at-risk');
        }
    });
    
    // Store current CGPA for next comparison
    localStorage.setItem('ugPreviousCGPA', cgpa.toFixed(2));
}

// ===== ADAPTIVE PROGRESS BAR FEEDBACK =====
function addProgressFeedback(cgpa) {
    const feedback = document.createElement('div');
    feedback.className = 'progress-feedback';
    
    if (cgpa >= 3.55 && cgpa < 3.60) {
        feedback.textContent = '🎯 Near First Class! Just 0.' + ((3.60 - cgpa).toFixed(2)).substring(2) + ' away!';
        feedback.classList.add('near-first');
    } else if (cgpa >= 2.95 && cgpa < 3.00) {
        feedback.textContent = '🚀 Almost Second Upper! Keep pushing!';
        feedback.classList.add('near-second');
    } else if (cgpa < 1.60) {
        feedback.textContent = '⚠️ Focus on improvement - seek academic support';
        feedback.classList.add('at-risk');
    } else if (cgpa >= 3.60) {
        feedback.textContent = '🌟 First Class Excellence!';
        feedback.classList.add('near-first');
    }
    
    return feedback.outerHTML;
}

// Update the generateProgressHTML function
const originalGenerateProgressHTML = generateProgressHTML;
function generateProgressHTML(cgpa, passed, total, classification) {
    const percentage = (cgpa / 4.0) * 100;
    const creditsPercentage = total > 0 ? (passed / total) * 100 : 0;
    const feedbackHTML = addProgressFeedback(cgpa);

    return `
        <div class="progress-item">
            ${feedbackHTML}
            <div class="progress-header">
                <span>CGPA Progress</span>
                <span class="progress-value">${cgpa.toFixed(2)} / 4.00</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentage}%"></div>
            </div>
            <div class="progress-label">${classification}</div>
        </div>
        <div class="progress-item">
            <div class="progress-header">
                <span>Credits Progress</span>
                <span class="progress-value">${passed} / ${total}</span>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar credits" style="width: ${creditsPercentage}%"></div>
            </div>
            <div class="progress-label">${passed} Passed | ${total} Taken</div>
        </div>
    `;
}

// ===== KEYBOARD NAVIGATION ENHANCEMENTS =====
document.addEventListener('keydown', function(e) {
    // Esc key closes modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('active');
        });
        
        // Close tour
        const tour = document.getElementById('tourOverlay');
        if (tour && tour.style.display !== 'none') {
            skipTour();
        }
    }
    
    // Ctrl/Cmd + K for quick navigation
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.nav-btn').focus();
    }
});

// Add arrow key navigation for nav buttons
document.querySelectorAll('.nav-btn').forEach((btn, index, buttons) => {
    btn.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            buttons[(index + 1) % buttons.length].focus();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            buttons[(index - 1 + buttons.length) % buttons.length].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
        }
    });
});

// Update dashboard to include smart insights
const originalUpdateDashboard = updateDashboard;
window.updateDashboard = function() {
    originalUpdateDashboard();
    updateSmartInsights();
};

// Make functions globally accessible
window.toggleCollapse = toggleCollapse;
window.updateSmartInsights = updateSmartInsights;
