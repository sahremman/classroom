// Simple data storage using localStorage
const STUDENTS_KEY = 'class_manager_students';
const ASSIGNMENTS_KEY = 'class_manager_assignments';

// Initialize data if not exists
function initData() {
    if (!localStorage.getItem(STUDENTS_KEY)) {
        localStorage.setItem(STUDENTS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(ASSIGNMENTS_KEY)) {
        localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify([]));
    }
}

// Helper function to get data from localStorage
function getData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Helper function to save data to localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Format a date string
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add a new student
function addStudent(name, email, classes) {
    const students = getData(STUDENTS_KEY);
    const newStudent = {
        id: generateId(),
        name: name,
        email: email,
        classes: classes
    };
    
    students.push(newStudent);
    saveData(STUDENTS_KEY, students);
    
    updateStudentCounts();
    renderAllStudents();
    
    if (classes.includes('soil-chemistry')) {
        renderStudentsList('soil-chemistry');
    }
    if (classes.includes('sustainable-dev')) {
        renderStudentsList('sustainable-dev');
    }
    
    return newStudent;
}

// Add a new assignment
function addAssignment(title, dueDate, description, classType) {
    const assignments = getData(ASSIGNMENTS_KEY);
    const newAssignment = {
        id: generateId(),
        title: title,
        dueDate: dueDate,
        description: description,
        classType: classType
    };
    
    assignments.push(newAssignment);
    saveData(ASSIGNMENTS_KEY, assignments);
    
    renderAssignmentsList(classType);
    
    return newAssignment;
}

// Delete a student
function deleteStudent(studentId) {
    const students = getData(STUDENTS_KEY);
    const updatedStudents = students.filter(student => student.id !== studentId);
    saveData(STUDENTS_KEY, updatedStudents);
    
    updateStudentCounts();
    renderAllStudents();
    renderStudentsList('soil-chemistry');
    renderStudentsList('sustainable-dev');
}

// Delete an assignment
function deleteAssignment(assignmentId) {
    const assignments = getData(ASSIGNMENTS_KEY);
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (!assignment) return;
    
    const classType = assignment.classType;
    const updatedAssignments = assignments.filter(a => a.id !== assignmentId);
    saveData(ASSIGNMENTS_KEY, updatedAssignments);
    
    renderAssignmentsList(classType);
}

// Render student lists for a specific class
function renderStudentsList(classType) {
    const listElement = document.getElementById(`${classType}-students-list`);
    if (!listElement) return;
    
    const students = getData(STUDENTS_KEY).filter(student => 
        student.classes.includes(classType)
    );
    
    if (students.length === 0) {
        listElement.innerHTML = '<tr><td colspan="3">No students enrolled yet</td></tr>';
        return;
    }
    
    let html = '';
    students.forEach(student => {
        html += `
            <tr>
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>
                    <button class="btn" onclick="deleteStudent('${student.id}')">Remove</button>
                </td>
            </tr>
        `;
    });
    
    listElement.innerHTML = html;
}

// Render all students on the dashboard
function renderAllStudents() {
    const container = document.getElementById('all-students-list');
    if (!container) return;
    
    const students = getData(STUDENTS_KEY);
    
    if (students.length === 0) {
        container.innerHTML = '<p>No students added yet.</p>';
        return;
    }
    
    let html = '<ul>';
    students.forEach(student => {
        const classes = student.classes.map(c => 
            c === 'soil-chemistry' ? 'Environmental Soil Chemistry' : 'Sustainable Development'
        ).join(', ');
        
        html += `
            <li>
                <strong>${student.name}</strong> (${student.email}) - ${classes}
                <button class="btn" onclick="deleteStudent('${student.id}')">Delete</button>
            </li>
        `;
    });
    html += '</ul>';
    
    container.innerHTML = html;
}

// Render assignments list for a class
function renderAssignmentsList(classType) {
    const listElement = document.getElementById(`${classType}-assignments-list`);
    if (!listElement) return;
    
    const assignments = getData(ASSIGNMENTS_KEY).filter(assignment => 
        assignment.classType === classType
    );
    
    if (assignments.length === 0) {
        listElement.innerHTML = '<tr><td colspan="4">No assignments yet</td></tr>';
        return;
    }
    
    let html = '';
    assignments.forEach(assignment => {
        html += `
            <tr>
                <td>${assignment.title}</td>
                <td>${formatDate(assignment.dueDate)}</td>
                <td>${assignment.description}</td>
                <td>
                    <button class="btn" onclick="deleteAssignment('${assignment.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    listElement.innerHTML = html;
}

// Update student counts on dashboard
function updateStudentCounts() {
    const students = getData(STUDENTS_KEY);
    
    const soilCount = students.filter(student => 
        student.classes.includes('soil-chemistry')
    ).length;
    
    const sustCount = students.filter(student => 
        student.classes.includes('sustainable-dev')
    ).length;
    
    const soilCountElement = document.getElementById('soil-students-count');
    const sustCountElement = document.getElementById('sust-students-count');
    
    if (soilCountElement) soilCountElement.textContent = soilCount;
    if (sustCountElement) sustCountElement.textContent = sustCount;
}

// Export student data as CSV
function exportStudentData() {
    const students = getData(STUDENTS_KEY);
    
    if (students.length === 0) {
        alert('No students to export.');
        return;
    }
    
    let csvContent = "Name,Email,Classes\n";
    
    students.forEach(student => {
        const classes = student.classes.map(c => 
            c === 'soil-chemistry' ? 'Environmental Soil Chemistry' : 'Sustainable Development'
        ).join('; ');
        
        csvContent += `${student.name},${student.email},"${classes}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'students.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Setup modal functionality
function setupModals() {
    // Add Student Modal
    const studentModals = document.querySelectorAll('#add-student-modal');
    const studentButtons = document.querySelectorAll('#add-student-btn, #add-student-soil-btn, #add-student-sust-btn');
    const studentForms = document.querySelectorAll('#add-student-form');
    const closeButtons = document.querySelectorAll('.close');
    
    // Add Assignment Modal
    const assignmentButtons = document.querySelectorAll('#add-assignment-soil-btn, #add-assignment-sust-btn');
    const assignmentForms = document.querySelectorAll('#add-assignment-form');
    
    //
