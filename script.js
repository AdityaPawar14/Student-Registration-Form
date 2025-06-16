// Array to hold students record in memory
let students = [];

// Index to track which student is being edited
// -1 means adding new student
let editingIndex = -1;

// Load saved student data from localStorage
window.addEventListener('load', () => {
    loadStudentsFromStorage(); 
    displayStudents();         
    setupFormListeners();      
});

// Function to load saved student data from localStorage
function loadStudentsFromStorage() {
    const savedStudents = localStorage.getItem('students'); 
    if (savedStudents) {
        try {
            students = JSON.parse(savedStudents); // Convert JSON string to JS array
        } catch {
            students = []; // If error start with empty array
        }
    }
}

// Save the current student list to localStorage
function saveStudentsToStorage() {
    try {
        localStorage.setItem('students', JSON.stringify(students)); // Convert array to JSON and save
    } catch {
        alert('Error saving data. Please try again.'); // Show error if storage fails
    }
}

// Validate the form inputs before adding or updating a student
function validateInput(name, studentId, studentClass, rollNo) {
    // Check if any field is empty
    if (!name.trim() || !studentId.trim() || !studentClass.trim() || !rollNo.trim()) {
        alert('Please fill in all fields');
        return false;
    }

    // Name should only contain letters and spaces
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
        alert('Student name must contain only letters and spaces');
        return false;
    }

    // Student ID and Roll No. should be in numbers
    if (!/^\d+$/.test(studentId.trim()) || !/^\d+$/.test(rollNo.trim())) {
        alert('Student ID and Roll No. must contain only numbers');
        return false;
    }

    // Check if Student ID already exists (except for the current editing one)
    const existingStudent = students.find((student, index) =>
        index !== editingIndex && student.studentId === studentId.trim()
    );

    if (existingStudent) {
        alert('Student ID already exists');
        return false;
    }

    return true; // All validations passed
}

// Function to add a new student or update an existing one
function addStudent() {
    // Get values from form inputs
    const name = document.getElementById('studentName').value;
    const studentId = document.getElementById('studentId').value;
    const studentClass = document.getElementById('class').value;
    const rollNo = document.getElementById('rollNo').value;

    // Validate the inputs
    if (!validateInput(name, studentId, studentClass, rollNo)) return;

    // Create a student object
    const student = {
        id: editingIndex === -1 ? Date.now().toString() : students[editingIndex].id, 
        name: name.trim(),
        studentId: studentId.trim(),
        class: studentClass.trim(),
        rollNo: rollNo.trim()
    };

    // If we're adding a new student
    if (editingIndex === -1) {
        students.push(student);
    } else {
        // If editing or update the existing student
        students[editingIndex] = student;
        editingIndex = -1; // reset to default
        document.querySelector('.add-button').textContent = 'Add'; // Change button label
    }

    saveStudentsToStorage();  //Save updated list
    clearForm();             // Reset the form
    displayStudents();       // Refresh the displayed list
}

// Clear or reset the form fields
function clearForm() {
    document.getElementById('studentForm').reset();
}

// Function to display students in the UI
function displayStudents() {
    const tableBody = document.getElementById('tableBody');

    // If no students then show empty message
    if (students.length === 0) {
        tableBody.innerHTML = '<div class="empty-state">No students registered yet</div>';
        return;
    }

    // Render student data inside the table
    tableBody.innerHTML = students.map((student, index) => `
        <div class="table-row">
            <div>${escapeHtml(student.name)}</div>
            <div>${escapeHtml(student.studentId)}</div>
            <div>${escapeHtml(student.class)}</div>
            <div>${escapeHtml(student.rollNo)}</div>
            <div><button class="action-button" onclick="resetStudent(${index})">Edit</button></div>
            <div><button class="action-button" onclick="deleteStudent(${index})">Delete</button></div>
        </div>
    `).join('');
}

// Function to prevent XSS by escaping HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML; 
}

// When user clicks "Edit" button then load that student data into the form
function resetStudent(index) {
    if (index < 0 || index >= students.length) return;

    const student = students[index];
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentId').value = student.studentId;
    document.getElementById('class').value = student.class;
    document.getElementById('rollNo').value = student.rollNo;

    editingIndex = index; 
    document.querySelector('.add-button').textContent = 'Update'; 
}

// Delete student at given index
function deleteStudent(index) {
    if (index < 0 || index >= students.length) return;

    if (confirm('Are you sure you want to delete this student record?')) {
        students.splice(index, 1); 
        saveStudentsToStorage();   

        // If the deleted student was being edited, reset form and mode
        if (editingIndex === index) {
            clearForm();
            editingIndex = -1;
            document.querySelector('.add-button').textContent = 'Add';
        } else if (editingIndex > index) {
            editingIndex--;
        }

        displayStudents(); 
    }
}

// Add keypress and focus/blur listeners to form
function setupFormListeners() {
    const form = document.getElementById('studentForm');
    if (form) {
        // Handle Enter key to submit form
        form.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); 
                addStudent();       
            }
        });
    }

    // Highlight form fields on focus and reset on blur
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', () => input.style.borderColor = '#333');
        input.addEventListener('blur', () => input.style.borderColor = '#666');
    });
}
