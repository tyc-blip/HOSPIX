import express, { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { StableBTreeMap,  Principal } from 'azle';
import * as crypto from 'crypto';

const app = express();
app.use(express.json());


let doctors = StableBTreeMap<Principal, Doctor>(100); // Doctor records
let patients = StableBTreeMap<string, Patient>(100); // Patient records
let auditLogs = StableBTreeMap<string, string>(100); // Action logs for audit

type Doctor = {
    doctorId: Principal;
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
    assignedDoctor: Principal; // Primary doctor
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
// Encryption Functions for secure data handling
function encryptData(data: string): string {
    const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from('encryption_key', 'utf8'), Buffer.alloc(16, 0));
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
// Decryption function
function decryptData(encrypted: string): string {
    const decipher = crypto.createCipheriv('aes-256-ctr', Buffer.from('encryption_key', 'utf8'), Buffer.alloc(16, 0));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// API Routes

// Route to create a new doctor
app.post('/addDoctor', (req, res) => {
    try {
        const { doctorId, name, role, department } = req.body;

        if (!doctorId || !name || !role || !department) {
            return res.status(400).json({ error: "Invalid input" });
        }

        let newDoctor: Doctor = {
            doctorId: Principal.fromText(doctorId),
            name,
            role,
            department
        };

        // Store doctor data securely
        doctors.insert(newDoctor.doctorId, newDoctor);
        logAction(newDoctor.doctorId, 'Added new doctor');
        res.status(201).json({ message: "Doctor added successfully" });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Audit logging function for tracking actions
function logAction(user: Principal, action: string) {
    let timestamp = new Date().toISOString();
    auditLogs.insert(timestamp, `${user.toText()} - ${action}`);
}

// Route to create a new patient
app.post('/addPatient', (req, res) => {
    try {
        const { patientId, name, age, medicalHistory, currentTreatment, assignedDoctor } = req.body;

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

        let newPatient: Patient = {
            patientId,
            name,
            age,
            medicalHistory,
            currentTreatment,
            assignedDoctor: Principal.fromText(assignedDoctor),
            reports: []
        };

        // Store patient data securely
        patients.insert(newPatient.patientId, newPatient);
        logAction(Principal.fromText(assignedDoctor), `Added patient record: ${newPatient.patientId}`);
        res.status(201).json({ message: "Patient added successfully" });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Route to create a new patient
app.post('/addPatient', (req, res) => {
    try {
        const { patientId, name, age, medicalHistory, currentTreatment, assignedDoctor } = req.body;

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

        let newPatient: Patient = {
            patientId,
            name,
            age,
            medicalHistory,
            currentTreatment,
            assignedDoctor: Principal.fromText(assignedDoctor),
            reports: []
        };

        // Store patient data securely
        patients.insert(newPatient.patientId, newPatient);
        logAction(Principal.fromText(assignedDoctor), `Added patient record: ${newPatient.patientId}`);
        res.status(201).json({ message: "Patient added successfully" });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Route to delete patient record (only doctors with full access)
app.delete('/deletePatient/:patientId/:doctorId', (req, res) => {
    try {
        const { patientId, doctorId } = req.params;

        let doctor = doctors.get(Principal.fromText(doctorId));
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }

        if (doctor.role === Role.FullAccess) {
            patients.remove(patientId);
            logAction(doctor.doctorId, `Deleted patient record: ${patientId}`);
            res.json({ message: "Patient deleted successfully" });
        } else {
            res.status(403).json({ error: "Doctor does not have permission to delete patient" });
        }
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Route for patients to view their records (read-only access)
app.get('/viewPatient/:patientId', (req, res) => {
    try {
        const { patientId } = req.params;

        let patient = patients.get(patientId);
        if (patient) {
            res.json(patient); // Patients can only view their records
            logAction(Principal.fromText(patientId), `Viewed patient record: ${patientId}`);
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
        let doctor = doctors.get(Principal.fromText(doctorId));

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
                    assignedDoctor: patient.assignedDoctor.toText(),
                    reports: patient.reports
                });
            }
        });

        logAction(Principal.fromText('admin'), 'Generated patient reports');
        res.json({ reportData });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// Route to get all audit logs
app.listen();
