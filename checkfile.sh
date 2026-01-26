#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up MediConnect project structure...${NC}\n"

# Function to create file if it doesn't exist
create_file() {
    local filepath="$1"
    local filetype="$2"
    
    if [ ! -f "$filepath" ]; then
        mkdir -p "$(dirname "$filepath")"
        touch "$filepath"
        echo -e "${GREEN}✓ Created: $filepath${NC}"
    else
        echo "  Already exists: $filepath"
    fi
}

# Function to create directory if it doesn't exist
create_dir() {
    local dirpath="$1"
    
    if [ ! -d "$dirpath" ]; then
        mkdir -p "$dirpath"
        echo -e "${GREEN}✓ Created directory: $dirpath${NC}"
    else
        echo "  Directory already exists: $dirpath"
    fi
}

echo -e "${BLUE}=== FRONTEND STRUCTURE ===${NC}\n"

# Frontend base directories
create_dir "mediconnect-mobile"
cd mediconnect-mobile

# App directories and files
echo -e "\n${BLUE}Creating app structure...${NC}"

# Auth routes
create_file "app/(auth)/login.tsx" "tsx"
create_file "app/(auth)/register.tsx" "tsx"
create_file "app/(auth)/_layout.tsx" "tsx"

# Patient routes
create_file "app/(patient)/_layout.tsx" "tsx"
create_file "app/(patient)/(tabs)/index.tsx" "tsx"
create_file "app/(patient)/(tabs)/appointments.tsx" "tsx"
create_file "app/(patient)/(tabs)/analytics.tsx" "tsx"
create_file "app/(patient)/(tabs)/profile.tsx" "tsx"
create_file "app/(patient)/(tabs)/qr-code.tsx" "tsx"
create_file "app/(patient)/doctors/index.tsx" "tsx"
create_file "app/(patient)/doctors/[id].tsx" "tsx"
create_file "app/(patient)/booking/[doctorId].tsx" "tsx"
create_file "app/(patient)/consultation/[id].tsx" "tsx"

# Doctor routes
create_file "app/(doctor)/_layout.tsx" "tsx"
create_file "app/(doctor)/(tabs)/index.tsx" "tsx"
create_file "app/(doctor)/(tabs)/appointments.tsx" "tsx"
create_file "app/(doctor)/(tabs)/patients.tsx" "tsx"
create_file "app/(doctor)/(tabs)/schedule.tsx" "tsx"
create_file "app/(doctor)/(tabs)/profile.tsx" "tsx"
create_file "app/(doctor)/(tabs)/qr-scanner.tsx" "tsx"
create_file "app/(doctor)/patient/[id].tsx" "tsx"
create_file "app/(doctor)/consultation/[id].tsx" "tsx"

# Root app files
create_file "app/_layout.tsx" "tsx"
create_file "app/index.tsx" "tsx"

# Components
echo -e "\n${BLUE}Creating components...${NC}"

# UI components
create_file "components/ui/Button.tsx" "tsx"
create_file "components/ui/Input.tsx" "tsx"
create_file "components/ui/Card.tsx" "tsx"
create_file "components/ui/Avatar.tsx" "tsx"
create_file "components/ui/Badge.tsx" "tsx"

# Shared components
create_file "components/shared/Header.tsx" "tsx"
create_file "components/shared/LoadingSpinner.tsx" "tsx"
create_file "components/shared/ErrorBoundary.tsx" "tsx"

# Patient components
create_file "components/patient/AppointmentCard.tsx" "tsx"
create_file "components/patient/QRCodeCard.tsx" "tsx"

# Doctor components
create_file "components/doctor/PatientCard.tsx" "tsx"
create_file "components/doctor/ScheduleCalendar.tsx" "tsx"
create_file "components/doctor/StatsCard.tsx" "tsx"

# Lib structure
echo -e "\n${BLUE}Creating lib structure...${NC}"

# API
create_file "lib/api/client.ts" "ts"
create_file "lib/api/auth.ts" "ts"
create_file "lib/api/appointments.ts" "ts"
create_file "lib/api/doctors.ts" "ts"
create_file "lib/api/patients.ts" "ts"
create_file "lib/api/qr.ts" "ts"

# Hooks
create_file "lib/hooks/useAuth.ts" "ts"
create_file "lib/hooks/useAppointments.ts" "ts"
create_file "lib/hooks/useQRCode.ts" "ts"
create_file "lib/hooks/useNotifications.ts" "ts"

# Stores
create_file "lib/stores/authStore.ts" "ts"
create_file "lib/stores/userStore.ts" "ts"

# Utils
create_file "lib/utils/formatters.ts" "ts"
create_file "lib/utils/validators.ts" "ts"
create_file "lib/utils/notifications.ts" "ts"

# Assets
echo -e "\n${BLUE}Creating assets directories...${NC}"
create_dir "assets/images"
create_dir "assets/icons"
create_dir "assets/fonts"

# Config files
echo -e "\n${BLUE}Creating config files...${NC}"
create_file "app.json" "json"
create_file "tailwind.config.js" "js"
create_file "package.json" "json"
create_file "tsconfig.json" "json"

# Backend structure
echo -e "\n${BLUE}=== BACKEND STRUCTURE ===${NC}\n"
cd ..
create_dir "mediconnect-backend"
cd mediconnect-backend

# Main app files
create_file "app/main.py" "py"
create_file "app/config.py" "py"

# API
echo -e "\n${BLUE}Creating API structure...${NC}"
create_file "app/api/deps.py" "py"
create_file "app/api/v1/auth.py" "py"
create_file "app/api/v1/users.py" "py"
create_file "app/api/v1/doctors.py" "py"
create_file "app/api/v1/patients.py" "py"
create_file "app/api/v1/appointments.py" "py"
create_file "app/api/v1/consultations.py" "py"
create_file "app/api/v1/qr.py" "py"
create_file "app/api/v1/notifications.py" "py"

# Models
echo -e "\n${BLUE}Creating models...${NC}"
create_file "app/models/__init__.py" "py"
create_file "app/models/user.py" "py"
create_file "app/models/doctor.py" "py"
create_file "app/models/patient.py" "py"
create_file "app/models/appointment.py" "py"
create_file "app/models/consultation.py" "py"

# Schemas
echo -e "\n${BLUE}Creating schemas...${NC}"
create_file "app/schemas/__init__.py" "py"
create_file "app/schemas/auth.py" "py"
create_file "app/schemas/user.py" "py"
create_file "app/schemas/doctor.py" "py"
create_file "app/schemas/patient.py" "py"
create_file "app/schemas/appointment.py" "py"
create_file "app/schemas/consultation.py" "py"
create_file "app/schemas/qr.py" "py"

# Services
echo -e "\n${BLUE}Creating services...${NC}"
create_file "app/services/__init__.py" "py"
create_file "app/services/auth_service.py" "py"
create_file "app/services/appointment_service.py" "py"
create_file "app/services/consultation_service.py" "py"
create_file "app/services/qr_service.py" "py"
create_file "app/services/notification_service.py" "py"

# Core
echo -e "\n${BLUE}Creating core modules...${NC}"
create_file "app/core/security.py" "py"
create_file "app/core/database.py" "py"

# Utils
echo -e "\n${BLUE}Creating utils...${NC}"
create_file "app/utils/validators.py" "py"
create_file "app/utils/helpers.py" "py"

# Tests
echo -e "\n${BLUE}Creating test structure...${NC}"
create_dir "tests/api"
create_dir "tests/models"
create_dir "tests/services"

# Config files
echo -e "\n${BLUE}Creating backend config files...${NC}"
create_file "requirements.txt" "txt"
create_file ".env" "env"

cd ..

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Project structure setup complete!${NC}"
echo -e "${GREEN}========================================${NC}"