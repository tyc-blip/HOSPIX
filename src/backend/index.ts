import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { StableBTreeMap } from 'azle';

const app = express();
app.use(express.json());

let doctors = StableBTreeMap<string, Doctor>(100); // Doctor records
let patients = StableBTreeMap<string, Patient>(100); // Patient records
let auditLogs = StableBTreeMap<string, string>(100); // Action logs for audit

type Doctor = {
    doctorId: string;
    name: string;
    role: Role; // Access control based on role
    department: string;
};
type Patient = {
    patientId: string;
    name: string;
    age: number;
    medicalHistory: string[];
    currentTreatment: string;
    assignedDoctor: string; // Primary doctor
    reports: string[]; // Medical reports
};
enum Role {
    FullAccess = "FullAccess",
    ReadOnly = "ReadOnly",
    ExternalConsultant = "ExternalConsultant"
}
class PatientDto {
    patientId!: string;
    name!: string;
    age!: number;
    medicalHistory!: string[];
    currentTreatment!: string;
    assignedDoctor!: string;
}

/**
 * Validates the input data for a patient.
 *
 * @param input - The patient data transfer object (DTO) containing patient details.
 * @returns A boolean indicating whether the input is valid.
 *
 * The input is considered valid if it contains the following properties:
 * - `patientId`: The unique identifier for the patient.
 * - `name`: The name of the patient.
 * - `age`: The age of the patient.
 * - `assignedDoctor`: The doctor assigned to the patient.
 */
function validatePatientInput(input: PatientDto): boolean {
    if (!input.patientId || !input.name || !input.age || !input.assignedDoctor) {
        return false;
    }
    return true;
}

// Audit logging function for tracking actions
function logAction(userId: string, action: string) {
    let timestamp = new Date().toISOString();
    auditLogs.insert(timestamp, `${userId} - ${action}`);
    console.log(timestamp, userId, action);
}
// API Routes

// Route to create a new doctor
app.post('/doctors', (req, res) => {
    try {
        const { name, role, department } = req.body;

        if (!name || !role || !department) {
            return res.status(400).json({ error: "Invalid input" });
        }
        let newDoctor: Doctor = {
            doctorId: uuidv4(),
            name,
            role,
            department
        };
        // Store doctor data securely
        doctors.insert(newDoctor.doctorId, newDoctor);
        logAction(newDoctor.doctorId, 'Added new doctor');
        res.status(201).json(newDoctor);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

//Get doctor details
app.get('/doctors/:doctorId', (req, res) => {
    try {
        const { doctorId } = req.params;
        let doctor = doctors.get(doctorId);
        if (doctor) {
            res.json(doctor);
        } else {
            res.status(404).json({ error: "Doctor not found" });
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Route to create a new patient
app.post('/patients', (req, res) => {
    try {
        const { name, age, medicalHistory, currentTreatment, assignedDoctor } = req.body;
        const id = uuidv4();
        let patientInput: PatientDto = {
            patientId: id,
            name,
            age,
            medicalHistory,
            currentTreatment,
            assignedDoctor
        };

        if (!validatePatientInput(patientInput)) {
            return res.status(400).json({ error: "Invalid patient data" });
        }

        let newPatient: Patient = {
            patientId : id,
            name,
            age,
            medicalHistory : medicalHistory ?? [],
            currentTreatment,
            assignedDoctor,
            reports: []
        };

        // Store patient data securely
        patients.insert(newPatient.patientId, newPatient);
        logAction(assignedDoctor, `Added patient record: ${newPatient.patientId}`);
        res.status(201).json({ newPatient });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

//Route to get patient details
app.get('/patients/:patientId', (req, res) => {
    try {
        const { patientId } = req.params;
        let patient = patients.get(patientId);
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ error: "Patient not found" });
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

//Route to update patiend details
app.put('/patients/:patientId', (req, res) => {
    try {
        const { patientId } = req.params;
        const { name, age, medicalHistory, currentTreatment, assignedDoctor } = req.body;

        let patientInput: PatientDto = {
            patientId,
            name,
            age,
            medicalHistory,
            currentTreatment,
            assignedDoctor
        };

        if (!validatePatientInput(patientInput)) {
            return res.status(400).json({ error: "Invalid patient data" });
        }

        let patient = patients.get(patientId);
        if (patient) {
            patient.name = name;
            patient.age = age;
            patient.medicalHistory = medicalHistory;
            patient.currentTreatment = currentTreatment;
            patient.assignedDoctor = assignedDoctor;

            patients.insert(patientId, patient);
            logAction(assignedDoctor, `Updated patient record: ${patientId}`);
            res.json(patient);
        } else {
            res.status(404).json({ error: "Patient not found" });
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

//Route to add medical report for a patient
app.put('/patients/:patientId/reports', (req, res) => {
    try {
        const { patientId } = req.params;
        const { report } = req.body;

        let patient = patients.get(patientId);
        if (patient) {
            patient.reports.push(report);
            patients.insert(patientId, patient);
            logAction(patient.assignedDoctor, `Added report for patient: ${patientId}`);
            res.json(patient.reports);
        } else {
            res.status(404).json({ error: "Patient not found" });
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

//route to get all reports of a patient
app.get('/patients/:patientId/reports', (req, res) => {
    try {
        const { patientId } = req.params;
        let patient = patients.get(patientId);
        if (patient) {
            res.json(patient.reports);
        } else {
            res.status(404).json({ error: "Patient not found" });
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Route to delete patient report
app.delete('/patients/:patientId/reports/:reportId', (req, res) => {
    try {
        const { patientId, reportId } = req.params;

        let patient = patients.get(patientId);
        if (patient) {
            let reportIndex = Number.parseInt(reportId);
            if (reportIndex >= 0 && reportIndex < patient.reports.length) {
                patient.reports.splice(reportIndex, 1);
                patients.insert(patientId, patient);
                logAction(patient.assignedDoctor, `Deleted report for patient: ${patientId}`);
                res.json({ message: "Report deleted successfully" });
            } else {
                res.status(404).json({ error: "Report not found" });
            }
        } else {
            res.status(404).json({ error: "Patient not found" });
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Route for patients to view their records (read-only access)
app.get('patients/:patientId', (req, res) => {
    try {
        const { patientId } = req.params;

        let patient = patients.get(patientId);
        if (patient) {
            res.json(patient); // Patients can only view their records
            logAction(patientId, `Viewed patient record: ${patientId}`);
        } else {
            res.status(404).json({ error: "Patient not found" });
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Route for hospital admin to assign doctors to patients
app.put('/assignDoctor', (req, res) => {
    try {
        const { patientId, doctorId } = req.body;

        let patient = patients.get(patientId);
        let doctor = doctors.get(doctorId);

        if (!patient || !doctor) {
            return res.status(404).json({ error: "Patient or Doctor not found" });
        }

        patient.assignedDoctor = doctor.doctorId; // Reassign doctor
        patients.insert(patientId, patient);
        logAction(doctor.doctorId, `Assigned to patient: ${patientId}`);

        res.json({ message: "Doctor assigned successfully" });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Route to generate reports (for hospital management)
app.get('/generateReports', (req, res) => {
    try {
        let reportData: Array<{
            patientId: string;
            name: string;
            currentTreatment: string;
            assignedDoctor: string;
            reports: string[];
        }> = [];

        patients.keys().forEach(patientId => {
            let patient = patients.get(patientId);
            if (patient) {
                reportData.push({
                    patientId: patient.patientId,
                    name: patient.name,
                    currentTreatment: patient.currentTreatment,
                    assignedDoctor: patient.assignedDoctor,
                    reports: patient.reports
                });
            }
        });

        logAction('admin', 'Generated patient reports');
        res.json({ reportData });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Route to get all audit logs
app.listen();
