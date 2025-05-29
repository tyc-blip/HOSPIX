# Patient Records Management API (ICP + TypeScript + Azle)

## Introduction
ZenX is a backend API for managing patient records, built on the Internet Computer Protocol (ICP) using TypeScript and Azle. It allows doctors and hospital administrators to securely store, update, and retrieve medical information about patients. The project aims to streamline the management of patient records by providing endpoints for various functionalities such as creating patient records, assigning doctors, generating reports, and auditing actions.

## Problem Statement
Managing patient records securely is critical in the healthcare industry. This API seeks to solve common issues in patient record management by ensuring:
- Secure data storage
- Comprehensive audit logs for actions
- Easy retrieval of medical records and patient reports

This API provides RESTful endpoints for hospitals to manage patient and doctor records efficiently while ensuring proper documentation and tracking of actions for auditing purposes.

## Features
- Create and manage doctor profiles
- Add, update, and delete patient records
- Generate medical reports and assign doctors to patients
- Log and audit all system actions for security purposes

## Requirements
- **Node.js** (v16+ recommended)
- **Azle**: A TypeScript framework for developing canisters on ICP
- **Express.js**: Web framework for handling API requests
- **UUID**: For generating unique identifiers for patients and doctors
- **PostMan**: For testing api endpoints

## Installation Guide

### Step 1: Install Azle
> Windows is only supported through a Linux virtual environment of some kind, such as [WSL](https://learn.microsoft.com/en-us/windows/wsl/install)

You will need [Node.js 20](#nodejs-20) and [dfx](#dfx) to develop ICP applications with Azle:

### Node.js 20

It's recommended to use nvm to install Node.js 20:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Restart your terminal and then run:

```bash
nvm install 20
```

Check that the installation went smoothly by looking for clean output from the following command:

```bash
node --version
```

### dfx

Install the dfx command line tools for managing ICP applications:

```bash
DFX_VERSION=0.22.0 sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

Check that the installation went smoothly by looking for clean output from the following command:

```bash
dfx --version
```

## Step 2: Clone the Repository
Next, clone this repository to your local machine:

```bash
git clone <https://github.com/Esfokom/ZenX>
```

## Step 3: Install Dependencies
Navigate to the project directory and install the required dependencies:

```bash
cd <ZenX>
npm install
```
This will install all the necessary packages from package.json.

## Step 4: Start the development server
Run the following commands in separate terminals

```bash
dfx start
```
In another terminal, run
```bash
dfx deploy
```
This will install all the necessary packages from package.json.

The url for the backend api http://be2us-64aaa-aaaaa-qaabq-cai.localhost:[YOUR_PORT]/

You can test with PostMan


## API Endpoints Documentation

## API Endpoints Overview

1. **Create a New Doctor**  
   Allows the creation of a new doctor record in the system.

2. **Get Doctor Details**  
   Retrieves the details of a specific doctor using their ID.

3. **Create a New Patient**  
   Creates a new patient record, including their medical history and assigned doctor.

4. **Get Patient Details**  
   Retrieves the details of a specific patient using their ID.

5. **Update Patient Details**  
   Updates the existing details of a patient, including their medical history and treatment.

6. **Add a Medical Report for a Patient**  
   Adds a new medical report to the patient's record.

7. **Get All Reports for a Patient**  
   Retrieves all medical reports associated with a specific patient.

8. **Delete a Medical Report**  
   Deletes a specific medical report from the patient's record.

9. **Assign Doctor to Patient**  
   Assigns or reassigns a doctor to a patient.

10. **Generate Reports (For Hospital Management)**  
    Generates a comprehensive report of all patients, their treatments, and assigned doctors.


  


  


