export interface Application {
  id: string;
  name: string;
  division: string;
  owner: string;
  custodian: string;
  securityCenter: string;
  created: string;
  updated: string;
  status: 'Active' | 'Inactive';
}

export const initialApplications: Application[] = [
  {
    id: 'IPPCS',
    name: 'Integrated Production Planning Control System',
    division: 'Production Planning Control',
    owner: '00123456', // Okubo
    custodian: '00123457', // Yoshida
    securityCenter: 'SC',
    created: '20-07-2024\n10:30:00',
    updated: '20-07-2024\n11:00:00',
    status: 'Active',
  },
  {
    id: 'PAS',
    name: 'Production Achievement System',
    division: 'Production Engineering',
    owner: '00234567', // Tanaka
    custodian: '00234568', // Sato
    securityCenter: 'Global SC',
    created: '19-07-2024\n09:00:00',
    updated: '19-07-2024\n09:45:00',
    status: 'Active',
  },
   {
    id: 'TMS',
    name: 'Toyota Management System',
    division: 'Corporate Planning',
    owner: '00345678', // Suzuki
    custodian: '00345679', // Takahashi
    securityCenter: 'TMMINRole',
    created: '18-07-2024\n14:00:00',
    updated: '18-07-2024\n15:10:00',
    status: 'Inactive',
  },
];

export interface SystemUser {
  id: string;
  name: string;
  division: string;
  email: string;
  department: string;
}

export const systemUsers: SystemUser[] = [
  { id: '00123456', name: 'Okubo', division: 'Production Planning Control', email: 'okubo@toyota.co.id', department: 'PPC Dept' },
  { id: '00123457', name: 'Yoshida', division: 'Production Planning Control', email: 'yoshida@toyota.co.id', department: 'PPC Dept' },
  { id: '00234567', name: 'Tanaka', division: 'Production Engineering', email: 'tanaka@toyota.co.id', department: 'PE Dept' },
  { id: '00234568', name: 'Sato', division: 'Production Engineering', email: 'sato@toyota.co.id', department: 'PE Dept' },
  { id: '00345678', name: 'Suzuki', division: 'Corporate Planning', email: 'suzuki@toyota.co.id', department: 'CP Dept' },
  { id: '00345679', name: 'Takahashi', division: 'Corporate Planning', email: 'takahashi@toyota.co.id', department: 'CP Dept' },
];

export const securityCenters: string[] = ['SC', 'Global SC', 'TMMINRole', 'LDAP'];


export interface LogEntry {
  id: number;
  processId: string;
  userId: string;
  module: string;
  functionName: string;
  startDate: string;
  endDate: string;
  status: 'Success' | 'Error' | 'Warning' | 'InProgress';
  details?: string;
}

// Categorized logs - only important data changes and critical actions
// Sorted from latest to oldest (newest first) - DESC order
// New activities will appear at the top automatically
export const mockLogs: LogEntry[] = [
    // Security Events - Authentication & Security (Latest)
    {
        id: 17,
        processId: '2025011600017',
        userId: 'admin',
        module: 'Security',
        functionName: 'Login Success',
        startDate: '21-07-2024 16:30:00',
        endDate: '21-07-2024 16:30:00',
        status: 'Success',
        details: 'User admin successfully logged in from IP: 192.168.1.100'
    },
    {
        id: 16,
        processId: '2025011600016',
        userId: 'unknown',
        module: 'Security',
        functionName: 'Login Failed',
        startDate: '21-07-2024 16:25:00',
        endDate: '21-07-2024 16:25:00',
        status: 'Error',
        details: 'Failed login attempt for username: testuser (attempt #3) - Potential brute force attack'
    },
    
    // In Progress - Current Operations
    {
        id: 15,
        processId: '2025011600015',
        userId: 'systemowner',
        module: 'UAR',
        functionName: 'Update',
        startDate: '21-07-2024 16:00:00',
        endDate: '21-07-2024 16:00:00',
        status: 'InProgress',
        details: 'Updating UAR progress for Division: Production Planning Control'
    },
    
    // Error Cases - Important to Track
    {
        id: 14,
        processId: '2025011600014',
        userId: 'dph',
        module: 'Application',
        functionName: 'Update',
        startDate: '21-07-2024 15:15:00',
        endDate: '21-07-2024 15:15:01',
        status: 'Error',
        details: 'Failed to update application: Database connection timeout'
    },
    {
        id: 13,
        processId: '2025011600013',
        userId: 'admin',
        module: 'UAR',
        functionName: 'Create',
        startDate: '21-07-2024 15:00:00',
        endDate: '21-07-2024 15:00:02',
        status: 'Error',
        details: 'Failed to create UAR record: Validation error - Invalid division code'
    },
    
    // Schedule Management - Critical Actions
    {
        id: 12,
        processId: '2025011600012',
        userId: 'systemowner',
        module: 'Schedule',
        functionName: 'Update',
        startDate: '21-07-2024 14:15:00',
        endDate: '21-07-2024 14:15:04',
        status: 'Success',
        details: 'Updated schedule: UAR Review Schedule for Q2 2025'
    },
    {
        id: 11,
        processId: '2025011600011',
        userId: 'admin',
        module: 'Schedule',
        functionName: 'Create',
        startDate: '21-07-2024 14:00:00',
        endDate: '21-07-2024 14:00:05',
        status: 'Success',
        details: 'Created new schedule: UAR Review Schedule for Q1 2025'
    },
    
    // User Management - Critical Actions
    {
        id: 10,
        processId: '2025011600010',
        userId: 'dph',
        module: 'User',
        functionName: 'Update',
        startDate: '21-07-2024 13:15:00',
        endDate: '21-07-2024 13:15:03',
        status: 'Success',
        details: 'Updated user permissions: UAR PIC for Division: Production Engineering'
    },
    {
        id: 9,
        processId: '2025011600009',
        userId: 'admin',
        module: 'User',
        functionName: 'Create',
        startDate: '21-07-2024 13:00:00',
        endDate: '21-07-2024 13:00:07',
        status: 'Success',
        details: 'Created new user: UAR PIC for Division: Production Planning Control'
    },
    
    // System Master Module - Critical Data Changes
    {
        id: 8,
        processId: '2025011600008',
        userId: 'admin',
        module: 'System Master',
        functionName: 'Update',
        startDate: '21-07-2024 12:15:00',
        endDate: '21-07-2024 12:15:04',
        status: 'Success',
        details: 'Updated system master: Security Center Configuration'
    },
    {
        id: 7,
        processId: '2025011600007',
        userId: 'systemowner',
        module: 'System Master',
        functionName: 'Create',
        startDate: '21-07-2024 12:00:00',
        endDate: '21-07-2024 12:00:06',
        status: 'Success',
        details: 'Created new system master record: LDAP Configuration'
    },
    
    // Application Module - Critical Data Changes
    {
        id: 6,
        processId: '2025011600006',
        userId: 'admin',
        module: 'Application',
        functionName: 'Update',
        startDate: '21-07-2024 11:30:00',
        endDate: '21-07-2024 11:30:03',
        status: 'Warning',
        details: 'Updated application status: Toyota Management System to Inactive'
    },
    {
        id: 5,
        processId: '2025011600005',
        userId: 'dph',
        module: 'Application',
        functionName: 'Update',
        startDate: '21-07-2024 11:15:00',
        endDate: '21-07-2024 11:15:05',
        status: 'Success',
        details: 'Updated application: Production Achievement System'
    },
    {
        id: 4,
        processId: '2025011600004',
        userId: 'admin',
        module: 'Application',
        functionName: 'Create',
        startDate: '21-07-2024 11:00:00',
        endDate: '21-07-2024 11:00:08',
        status: 'Success',
        details: 'Created new application: Integrated Production Planning Control System'
    },
    
    // UAR Module - Critical Data Changes (Oldest)
    {
        id: 3,
        processId: '2025011600003',
        userId: 'systemowner',
        module: 'UAR',
        functionName: 'Delete',
        startDate: '21-07-2024 10:30:00',
        endDate: '21-07-2024 10:30:02',
        status: 'Success',
        details: 'Deleted UAR record for Division: Corporate Planning'
    },
    {
        id: 2,
        processId: '2025011600002',
        userId: 'dph',
        module: 'UAR',
        functionName: 'Update',
        startDate: '21-07-2024 10:15:00',
        endDate: '21-07-2024 10:15:03',
        status: 'Success',
        details: 'Updated UAR progress for Division: Production Engineering'
    },
    {
        id: 1,
        processId: '2025011600001',
        userId: 'admin',
        module: 'UAR',
        functionName: 'Create',
        startDate: '21-07-2024 10:00:00',
        endDate: '21-07-2024 10:00:05',
        status: 'Success',
        details: 'Created new UAR record for Division: Production Planning Control'
    }
];

export interface LogDetail {
  id: number;
  messageDateTime: string;
  location: string;
  messageDetail: string;
}

export const mockLogDetails: LogDetail[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    messageDateTime: `21-07-2024 10:${String(i).padStart(2, '0')}:${String(i*2 % 60).padStart(2,'0')}`,
    location: `Module.FunctionName.Step${i+1}`,
    messageDetail: `Execution step ${i+1} completed. ${i % 4 === 0 ? 'Encountered a minor warning.' : 'Proceeding to next step.'}`
}));

export interface PicUser {
  id: number;
  name: string;
  division: string;
  email: string;
}

export const divisions: string[] = [
  'Production Planning Control',
  'Production Engineering',
  'Corporate Planning',
  'Human Resources',
  'Finance & Accounting',
  'IT Division'
];

export const initialPicUsers: PicUser[] = [
  { id: 1, name: 'Hesti', division: 'IT Division', email: 'hesti@toyota.co.id' },
  { id: 2, name: 'Budi', division: 'Human Resources', email: 'budi@toyota.co.id' },
  { id: 3, name: 'Citra', division: 'Finance & Accounting', email: 'citra@toyota.co.id' },
];

export interface SystemMasterRecord {
  id: number;
  systemType: string;
  systemCode: string;
  validFrom: string; // DD-MM-YYYY
  validTo: string; // DD-MM-YYYY
  systemValueText: string;
  systemValueNum: number;
  systemValueTime: string; // HH:mm:ss
  createdBy: string;
  createdDate: string; // DD-MM-YYYY\nHH:mm:ss
  changedBy: string;
  changedDate: string; // DD-MM-YYYY\nHH:mm:ss
}

export const initialSystemMasterData: SystemMasterRecord[] = [
    {
        id: 1,
        systemType: 'UAR_SCHEDULE',
        systemCode: 'UAR_START_DATE',
        validFrom: '01-01-2024',
        validTo: '31-12-2024',
        systemValueText: 'Start date for UAR process',
        systemValueNum: 1,
        systemValueTime: '09:00:00',
        createdBy: 'Admin',
        createdDate: '01-01-2024\n08:00:00',
        changedBy: 'Admin',
        changedDate: '01-01-2024\n08:00:00',
    },
    {
        id: 2,
        systemType: 'UAR_SCHEDULE',
        systemCode: 'UAR_END_DATE',
        validFrom: '01-01-2024',
        validTo: '31-12-2024',
        systemValueText: 'End date for UAR process',
        systemValueNum: 30,
        systemValueTime: '17:00:00',
        createdBy: 'Admin',
        createdDate: '01-01-2024\n08:00:00',
        changedBy: 'Admin',
        changedDate: '01-01-2024\n08:00:00',
    },
];

export interface UarLatestRole {
  id: number;
  applicationId: string;
  username: string;
  noreg: string;
  name: string;
  roleId: string;
  roleDescription: string;
  division: string;
  department: string;
  position: string;
}

export const initialUarLatestRoles: UarLatestRole[] = [
    { id: 1, applicationId: 'IPPCS', username: 'putri.imelda', noreg: '00223456', name: 'Putri Imelda', roleId: 'IPPCS_FD_AR', roleDescription: 'Finance AR', division: 'ISTD', department: 'CIO', position: 'Section Head' },
    { id: 2, applicationId: 'IPPCS', username: 'putri.simanjutak', noreg: '02233453', name: 'Putri Simanjuntak', roleId: 'IPPCS_FD_AR', roleDescription: 'HRD', division: 'ISTD', department: 'CIO', position: 'Section Head' },
    { id: 3, applicationId: 'IPPCS', username: 'budi.sukma', noreg: '02234567', name: 'Budi Sukma', roleId: 'IPPCS_FD_MKT', roleDescription: 'Marketing', division: 'ISTD', department: 'CIO', position: 'Manager' },
    { id: 4, applicationId: 'IPPCS', username: 'sari.ningsih', noreg: '02234568', name: 'Sari Ningsih', roleId: 'IPPCS_FD_SALES', roleDescription: 'Sales', division: 'ISTD', department: 'CIO', position: 'Manager' },
    { id: 5, applicationId: 'IPPCS', username: 'adi.wijaya', noreg: '02234569', name: 'Adi Wijaya', roleId: 'IPPCS_FD_IT', roleDescription: 'IT Support', division: 'ISTD', department: 'CIO', position: 'Team Lead' },
    { id: 6, applicationId: 'IPPCS', username: 'ani.martini', noreg: '02234570', name: 'Ani Martini', roleId: 'IPPCS_FD_DEV', roleDescription: 'Development', division: 'ISTD', department: 'CIO', position: 'Team Lead' },
    { id: 7, applicationId: 'IPPCS', username: 'rio.hartono', noreg: '02234571', name: 'Rio Hartono', roleId: 'IPPCS_FD_CUST', roleDescription: 'Customer Support', division: 'ISTD', department: 'CIO', position: 'Manager' },
    { id: 8, applicationId: 'IPPCS', username: 'lina.purnama', noreg: '02234572', name: 'Lina Purnama', roleId: 'IPPCS_FD_PR', roleDescription: 'Public Relations', division: 'ISTD', department: 'CIO', position: 'Manager' },
    { id: 9, applicationId: 'IPPCS', username: 'fahmi.rahman', noreg: '02234573', name: 'Fahmi Rahman', roleId: 'IPPCS_FD_LOG', roleDescription: 'Logistics', division: 'ISTD', department: 'CIO', position: 'Section Head' },
    { id: 10, applicationId: 'IPPCS', username: 'nina.sari', noreg: '02234574', name: 'Nina Sari', roleId: 'IPPCS_FD_QA', roleDescription: 'Quality Assurance', division: 'ISTD', department: 'CIO', position: 'Manager' },
    { id: 11, applicationId: 'PAS', username: 'dedi.irawan', noreg: '02234575', name: 'Dedi Irawan', roleId: 'PAS_PROD_LEAD', roleDescription: 'Production Lead', division: 'PROD', department: 'ENG', position: 'Supervisor' },
    { id: 12, applicationId: 'PAS', username: 'siti.nurhaliza', noreg: '02234576', name: 'Siti Nurhaliza', roleId: 'PAS_QC_INSPECT', roleDescription: 'QC Inspector', division: 'PROD', department: 'QC', position: 'Staff' },
];

export const roleInformationData: Record<string, string[]> = {
  'IPPCS_FD_AR': [
    'Inventory Management Administrator',
    'Inventory Management Logistic',
    'Inventory Management Call Center',
  ],
  'IPPCS_FD_MKT': [
    'Marketing Campaign Manager',
    'Social Media Coordinator',
    'Digital Advertising Specialist',
  ],
  'IPPCS_FD_SALES': [
    'Sales Representative',
    'Account Executive',
  ],
  'IPPCS_FD_IT': [
    'IT Support Specialist',
    'Network Administrator',
  ],
  'IPPCS_FD_DEV': [
    'Software Developer',
    'Frontend Engineer',
    'Backend Engineer',
  ],
  'IPPCS_FD_CUST': [
    'Customer Support Agent',
    'Technical Support',
  ],
  'IPPCS_FD_PR': [
    'Public Relations Officer',
  ],
  'IPPCS_FD_LOG': [
    'Logistics Coordinator',
    'Warehouse Manager',
  ],
  'IPPCS_FD_QA': [
    'Quality Assurance Tester',
  ],
  'PAS_PROD_LEAD': [
    'Production Line Supervisor',
    'Shift Leader',
  ],
  'PAS_QC_INSPECT': [
    'Quality Control Inspector',
    'Product Tester',
  ],
};

export interface Schedule {
  id: number;
  applicationId: string;
  applicationName: string;
  scheduleSync: string;
  scheduleUar: string;
  status: 'Active' | 'Inactive';
}

export const initialSchedules: Schedule[] = [
  { id: 1, applicationId: 'IPPCS', applicationName: 'IPPCS', scheduleSync: '07 June - 12 December', scheduleUar: '13 June', status: 'Active' },
  { id: 2, applicationId: 'IPPCS', applicationName: 'IPPCS', scheduleSync: '07 December - 12 December', scheduleUar: '13 June', status: 'Active' },
  { id: 3, applicationId: 'TVEST', applicationName: 'TVEST', scheduleSync: '06 June - 09 June', scheduleUar: '13 June', status: 'Active' },
  { id: 4, applicationId: 'IFAST', applicationName: 'IFAST', scheduleSync: '07 June - 12 June', scheduleUar: '03 June', status: 'Active' },
  { id: 5, applicationId: 'RCS', applicationName: 'RCS', scheduleSync: '07 June - 12 June', scheduleUar: '03 June', status: 'Active' },
  { id: 6, applicationId: 'CUSTOM_REPORT', applicationName: 'CUSTOM REPORT', scheduleSync: '07 June - 12 June', scheduleUar: '03 June', status: 'Inactive' },
  { id: 7, applicationId: 'CUSTOM_REPORT', applicationName: 'CUSTOM REPORT', scheduleSync: '07 June - 12 June', scheduleUar: '03 June', status: 'Active' },
  { id: 8, applicationId: 'CUSTOM_REPORT', applicationName: 'CUSTOM REPORT', scheduleSync: '07 June - 12 June', scheduleUar: '03 June', status: 'Active' },
  { id: 9, applicationId: 'TVEST', applicationName: 'TVEST', scheduleSync: '01 June - 05 June', scheduleUar: '06 June', status: 'Active' },
  { id: 10, applicationId: 'IFAST', applicationName: 'IFAST', scheduleSync: '02 June - 08 June', scheduleUar: '09 June', status: 'Inactive' },
  { id: 11, applicationId: 'RCS', applicationName: 'RCS', scheduleSync: '03 June - 10 June', scheduleUar: '11 June', status: 'Active' },
  { id: 12, applicationId: 'IPPCS', applicationName: 'IPPCS', scheduleSync: '04 June - 11 June', scheduleUar: '12 June', status: 'Active' },
];

export interface UarSystemOwnerRecord {
  id: number;
  uarId: string;
  divisionOwner: string;
  percentComplete: string;
  createDate: string;
  completedDate: string;
  status: 'Finished' | 'InProgress';
}

export const initialUarSystemOwnerData: UarSystemOwnerRecord[] = [
  { id: 1, uarId: 'UAR_072025_IPPCS', divisionOwner: 'PCD', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 2, uarId: 'UAR_072025_PAS', divisionOwner: 'Administrator', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'InProgress' },
  { id: 3, uarId: 'UAR_072025_APPCS', divisionOwner: 'Administrator', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 4, uarId: 'UAR_072025_LKI', divisionOwner: 'Administrator', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 5, uarId: 'UAR_072025_ICS', divisionOwner: 'Administrator', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 6, uarId: 'UAR_072025_KCI', divisionOwner: 'Administrator', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'InProgress' },
  { id: 7, uarId: 'UAR_072025_SPO', divisionOwner: 'Administrator', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 8, uarId: 'UAR_072025_SPOT', divisionOwner: 'Administrator', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 9, uarId: 'UAR_072025_AVS', divisionOwner: 'Administrator', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 10, uarId: 'UAR_072025_IPO', divisionOwner: 'Administrator', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 11, uarId: 'UAR_072025_XYZ', divisionOwner: 'PCD', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'InProgress' },
  { id: 12, uarId: 'UAR_072025_ABC', divisionOwner: 'Administrator', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
];

export interface UarSystemOwnerDetail {
  id: number;
  uarId: string;
  username: string;
  noreg: string;
  name: string;
  company: string;
  division: string;
  position: string;
  roleId: string;
  roleDescription: string;
  reviewed: boolean;
  comments?: Comment[];
}

const generateSystemOwnerDetailData = (): UarSystemOwnerDetail[] => {
  const details: UarSystemOwnerDetail[] = [];
  let detailId = 1;

  initialUarSystemOwnerData.forEach(record => {
    const totalItems = 47;
    const isFinished = record.status === 'Finished';
    const reviewedCount = isFinished ? totalItems : Math.floor(totalItems * 0.3); // ~30% for InProgress

    for (let i = 0; i < totalItems; i++) {
      details.push({
        id: detailId++,
        uarId: record.uarId,
        username: `user.${record.divisionOwner.toLowerCase().replace(' ', '')}.${i}`,
        noreg: String(223456 + i + detailId).padStart(8, '0'),
        name: `User Name ${detailId}`,
        company: 'PT Danantara Indonesia',
        division: 'Engineer',
        position: 'Staff',
        roleId: 'IPPCS_FD_AR',
        roleDescription: 'Finance AR',
        reviewed: i < reviewedCount,
        comments: undefined,
      });
    }
  });
  return details;
};

export const initialUarSystemOwnerDetailData: UarSystemOwnerDetail[] = generateSystemOwnerDetailData();


export interface UarDivisionUserRecord {
  id: number;
  uarId: string;
  divisionOwner: string;
  percentComplete: string;
  createDate: string;
  completedDate: string;
  status: 'Finished' | 'InProgress';
}

export const initialUarDivisionUserData: UarDivisionUserRecord[] = [
  { id: 1, uarId: 'UAR_072025_IPPCS', divisionOwner: 'PCD', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 2, uarId: 'UAR_072025_PAS', divisionOwner: 'ISTD', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'InProgress' },
  { id: 3, uarId: 'UAR_072025_APPCS', divisionOwner: 'FIN', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 4, uarId: 'UAR_072025_LKI', divisionOwner: 'HRD', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 5, uarId: 'UAR_072025_ICS', divisionOwner: 'ISTD', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 6, uarId: 'UAR_072025_KCI', divisionOwner: 'ISTD', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'InProgress' },
  { id: 7, uarId: 'UAR_072025_SPO', divisionOwner: 'ISTD', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 8, uarId: 'UAR_072025_SPOT', divisionOwner: 'ISTD', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 9, uarId: 'UAR_072025_AVS', divisionOwner: 'ISTD', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 10, uarId: 'UAR_072025_IPO', divisionOwner: 'ISTD', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
  { id: 11, uarId: 'UAR_072025_XYZ', divisionOwner: 'PCD', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'InProgress' },
  { id: 12, uarId: 'UAR_072025_ABC', divisionOwner: 'FIN', percentComplete: '100% (47 of 47)', createDate: '24-06-2025 10:00:00', completedDate: '24-06-2025 10:00:00', status: 'Finished' },
];

export interface Comment {
    user: string;
    text: string;
    timestamp: Date;
}

export interface UarDivisionUserReviewDetail {
  id: number;
  uarId: string;
  username: string;
  noreg: string;
  name: string;
  roleId: string;
  roleDescription: string;
  status: 'Mutation' | 'Rotation' | 'Fixed';
  reviewed: boolean;
  comments?: Comment[];
}

const generateDivisionUserDetailData = (): UarDivisionUserReviewDetail[] => {
    const details: UarDivisionUserReviewDetail[] = [];
    let detailId = 1;

    initialUarDivisionUserData.forEach(record => {
        const totalItems = 47;
        const isFinished = record.status === 'Finished';
        const reviewedCount = isFinished ? totalItems : Math.floor(totalItems * 0.6); // ~60% for InProgress

        const statuses: ('Mutation' | 'Rotation' | 'Fixed')[] = ['Mutation', 'Rotation', 'Fixed'];

        for (let i = 0; i < totalItems; i++) {
            details.push({
                id: detailId++,
                uarId: record.uarId,
                username: `user.${record.divisionOwner.toLowerCase()}.${i}`,
                noreg: String(330000 + i + detailId).padStart(8, '0'),
                name: `Division User ${detailId}`,
                roleId: 'IPPCS_FD_AR',
                roleDescription: 'Finance AR',
                status: statuses[i % 3],
                reviewed: i < reviewedCount,
                comments: (i % 5 === 0 && i < reviewedCount) ? [{ user: 'Hesti (Admin)', text: `Initial check for ${detailId}`, timestamp: new Date() }] : undefined,
            });
        }
    });
    return details;
};

export const initialUarDivisionUserReviewData: UarDivisionUserReviewDetail[] = generateDivisionUserDetailData();


export interface UarProgressData {
  label: string;
  total: number;
  approved: number;
  review: number;
  soApproved: number;
  division?: string;
  department?: string;
}

export const uarDivisionProgress: UarProgressData[] = [
    { label: 'PWPD', total: 90, approved: 85, review: 87, soApproved: 80 },
    { label: 'PAD', total: 84, approved: 80, review: 81, soApproved: 78 },
    { label: 'GAD', total: 89, approved: 82, review: 85, soApproved: 80 },
    { label: 'ISTD', total: 93, approved: 88, review: 90, soApproved: 85 },
    { label: 'EMD', total: 82, approved: 80, review: 80, soApproved: 77 },
    { label: 'FSD', total: 75, approved: 72, review: 73, soApproved: 71 },
    { label: 'HRD', total: 93, approved: 87, review: 90, soApproved: 88 },
    { label: 'ITD', total: 83, approved: 75, review: 82, soApproved: 78 },
    { label: 'MKT', total: 91, approved: 85, review: 88, soApproved: 83 },
    { label: 'RND', total: 92, approved: 85, review: 89, soApproved: 86 },
    { label: 'QAD', total: 83, approved: 78, review: 82, soApproved: 79 },
    { label: 'SCD', total: 78, approved: 73, review: 75, soApproved: 72 },
    { label: 'PRD', total: 90, approved: 85, review: 88, soApproved: 86 },
    { label: 'FIN', total: 87, approved: 83, review: 85, soApproved: 84 },
    { label: 'LOG', total: 83, approved: 78, review: 80, soApproved: 75 },
    { label: 'SAD', total: 80, approved: 74, review: 79, soApproved: 72 },
    { label: 'TMD', total: 90, approved: 83, review: 87, soApproved: 82 },
    { label: 'CRD', total: 85, approved: 80, review: 82, soApproved: 80 },
    { label: 'EVD', total: 94, approved: 88, review: 91, soApproved: 89 },
    { label: 'BDD', total: 85, approved: 80, review: 84, soApproved: 81 },
    { label: 'CMD', total: 83, approved: 78, review: 82, soApproved: 77 },
    { label: 'SPD', total: 93, approved: 88, review: 90, soApproved: 91 },
    { label: 'HSD', total: 95, approved: 90, review: 92, soApproved: 89 },
    { label: 'OPD', total: 85, approved: 80, review: 82, soApproved: 79 },
    { label: 'ASD', total: 92, approved: 87, review: 89, soApproved: 90 },
    { label: 'CSD', total: 92, approved: 83, review: 87, soApproved: 86 },
];

export const uarDepartmentProgress: UarProgressData[] = [
    // ISTD
    { label: 'CIO', total: 90, approved: 84, review: 87, soApproved: 86, division: 'ISTD' },
    { label: 'NWS', total: 85, approved: 79, review: 82, soApproved: 80, division: 'ISTD' },
    { label: 'SSL', total: 88, approved: 82, review: 85, soApproved: 84, division: 'ISTD' },
    { label: 'SCM', total: 92, approved: 86, review: 89, soApproved: 88, division: 'ISTD' },
    // PWPD
    { label: 'PWPD-A', total: 88, approved: 82, review: 85, soApproved: 81, division: 'PWPD' },
    { label: 'PWPD-B', total: 91, approved: 86, review: 88, soApproved: 83, division: 'PWPD' },
    // PAD
    { label: 'PAD-A', total: 85, approved: 81, review: 82, soApproved: 79, division: 'PAD' },
    // GAD
    { label: 'GAD-Main', total: 89, approved: 82, review: 85, soApproved: 80, division: 'GAD' },
    // EMD
    { label: 'EMD-1', total: 84, approved: 78, review: 82, soApproved: 80, division: 'EMD' },
    // FSD
    { label: 'FSD-1', total: 78, approved: 74, review: 76, soApproved: 73, division: 'FSD' },
    // HRD
    { label: 'HRD-Recruitment', total: 94, approved: 88, review: 91, soApproved: 89, division: 'HRD' },
    { label: 'HRD-Payroll', total: 92, approved: 86, review: 89, soApproved: 87, division: 'HRD' },
    // ITD
    { label: 'ITD-Infra', total: 85, approved: 78, review: 83, soApproved: 80, division: 'ITD' },
    { label: 'ITD-Apps', total: 88, approved: 81, review: 85, soApproved: 82, division: 'ITD' },
    // MKT
    { label: 'MKT-Digital', total: 92, approved: 87, review: 89, soApproved: 85, division: 'MKT' },
    // RND
    { label: 'RND-Labs', total: 93, approved: 86, review: 90, soApproved: 88, division: 'RND' },
    // QAD
    { label: 'QAD-Audit', total: 85, approved: 80, review: 83, soApproved: 81, division: 'QAD' },
    // SCD
    { label: 'SCD-Logistics', total: 80, approved: 75, review: 78, soApproved: 74, division: 'SCD' },
    // PRD
    { label: 'PRD-Ops', total: 91, approved: 86, review: 89, soApproved: 87, division: 'PRD' },
    // FIN
    { label: 'FIN-Accounting', total: 88, approved: 84, review: 86, soApproved: 85, division: 'FIN' },
    // LOG
    { label: 'LOG-Warehouse', total: 85, approved: 80, review: 82, soApproved: 78, division: 'LOG' },
    // SAD
    { label: 'SAD-Sales', total: 82, approved: 76, review: 80, soApproved: 75, division: 'SAD' },
    // TMD
    { label: 'TMD-Training', total: 91, approved: 85, review: 88, soApproved: 84, division: 'TMD' },
    // CRD
    { label: 'CRD-Internal', total: 86, approved: 81, review: 83, soApproved: 81, division: 'CRD' },
    // EVD
    { label: 'EVD-Planning', total: 95, approved: 90, review: 92, soApproved: 91, division: 'EVD' },
    // BDD
    { label: 'BDD-Analytics', total: 86, approved: 81, review: 85, soApproved: 83, division: 'BDD' },
    // CMD
    { label: 'CMD-Comms', total: 84, approved: 79, review: 83, soApproved: 79, division: 'CMD' },
    // SPD
    { label: 'SPD-Proc', total: 94, approved: 89, review: 91, soApproved: 92, division: 'SPD' },
    // HSD
    { label: 'HSD-Safety', total: 96, approved: 91, review: 93, soApproved: 90, division: 'HSD' },
    // OPD
    { label: 'OPD-Dash', total: 86, approved: 81, review: 83, soApproved: 80, division: 'OPD' },
    // ASD
    { label: 'ASD-Assets', total: 93, approved: 88, review: 90, soApproved: 91, division: 'ASD' },
    // CSD
    { label: 'CSD-Support', total: 93, approved: 85, review: 88, soApproved: 87, division: 'CSD' },
];

export const uarSystemProgressData: UarProgressData[] = [
  // ISTD Division (9 apps)
  { label: 'SAR', total: 92, approved: 86, review: 90, soApproved: 89, division: 'ISTD', department: 'CIO' },
  { label: 'TPM', total: 89, approved: 80, review: 84, soApproved: 82, division: 'ISTD', department: 'CIO' },
  { label: 'PASS', total: 91, approved: 84, review: 89, soApproved: 85, division: 'ISTD', department: 'NWS' },
  { label: 'FAMS', total: 85, approved: 80, review: 82, soApproved: 79, division: 'ISTD', department: 'SSL' },
  { label: 'BMS', total: 89, approved: 81, review: 84, soApproved: 82, division: 'ISTD', department: 'SCM' },
  { label: 'HELPDESK', total: 90, approved: 85, review: 88, soApproved: 86, division: 'ISTD', department: 'CIO' },
  { label: 'IAM', total: 93, approved: 88, review: 91, soApproved: 90, division: 'ISTD', department: 'SSL' },
  { label: 'CMDB', total: 88, approved: 82, review: 86, soApproved: 84, division: 'ISTD', department: 'CIO' },
  { label: 'IT-ASSET', total: 90, approved: 84, review: 88, soApproved: 85, division: 'ISTD', department: 'CIO' },

  // PWPD Division (5 apps)
  { label: 'PLAN-A', total: 88, approved: 83, review: 86, soApproved: 84, division: 'PWPD', department: 'PWPD-A' },
  { label: 'SCHED-A', total: 90, approved: 85, review: 87, soApproved: 82, division: 'PWPD', department: 'PWPD-A' },
  { label: 'PLAN-B', total: 89, approved: 84, review: 87, soApproved: 85, division: 'PWPD', department: 'PWPD-B' },
  { label: 'PROD-SIM', total: 92, approved: 87, review: 89, soApproved: 88, division: 'PWPD', department: 'PWPD-A' },
  { label: 'CAP-PLAN', total: 87, approved: 81, review: 84, soApproved: 80, division: 'PWPD', department: 'PWPD-B' },

  // PAD Division (4 apps)
  { label: 'ADMIN-1', total: 85, approved: 80, review: 82, soApproved: 80, division: 'PAD', department: 'PAD-A' },
  { label: 'ADMIN-2', total: 86, approved: 81, review: 83, soApproved: 81, division: 'PAD', department: 'PAD-A' },
  { label: 'DOC-MGMT', total: 88, approved: 83, review: 85, soApproved: 82, division: 'PAD', department: 'PAD-A' },
  { label: 'E-APPROVAL', total: 89, approved: 84, review: 86, soApproved: 83, division: 'PAD', department: 'PAD-A' },

  // GAD Division (4 apps)
  { label: 'GAD-SYS', total: 90, approved: 85, review: 88, soApproved: 86, division: 'GAD', department: 'GAD-Main' },
  { label: 'GAD-UTIL', total: 88, approved: 83, review: 85, soApproved: 84, division: 'GAD', department: 'GAD-Main' },
  { label: 'FLEET-MGMT', total: 87, approved: 82, review: 84, soApproved: 81, division: 'GAD', department: 'GAD-Main' },
  { label: 'BLDG-MAINT', total: 86, approved: 80, review: 83, soApproved: 79, division: 'GAD', department: 'GAD-Main' },
  
  // EMD Division (3 apps)
  { label: 'EMD-APP', total: 83, approved: 79, review: 81, soApproved: 78, division: 'EMD', department: 'EMD-1' },
  { label: 'ENG-DOC', total: 85, approved: 80, review: 82, soApproved: 79, division: 'EMD', department: 'EMD-1' },
  { label: 'MAINT-SCHED', total: 84, approved: 78, review: 81, soApproved: 77, division: 'EMD', department: 'EMD-1' },

  // FSD Division (3 apps)
  { label: 'FSD-FIN', total: 76, approved: 73, review: 74, soApproved: 72, division: 'FSD', department: 'FSD-1' },
  { label: 'SAFETY-LOG', total: 78, approved: 74, review: 76, soApproved: 73, division: 'FSD', department: 'FSD-1' },
  { label: 'ENV-MONITOR', total: 77, approved: 72, review: 75, soApproved: 71, division: 'FSD', department: 'FSD-1' },

  // HRD Division (3 apps)
  { label: 'HRIS', total: 93, approved: 88, review: 91, soApproved: 90, division: 'HRD', department: 'HRD-Recruitment' },
  { label: 'PAYROLL', total: 95, approved: 91, review: 93, soApproved: 92, division: 'HRD', department: 'HRD-Payroll' },
  { label: 'RECRUIT', total: 90, approved: 85, review: 88, soApproved: 86, division: 'HRD', department: 'HRD-Recruitment' },

  // ITD Division (3 apps)
  { label: 'HELPDESK-IT', total: 86, approved: 80, review: 83, soApproved: 79, division: 'ITD', department: 'ITD-Apps' },
  { label: 'NETWORK-MON', total: 88, approved: 82, review: 85, soApproved: 81, division: 'ITD', department: 'ITD-Infra' },
  { label: 'SERVER-MGMT', total: 87, approved: 81, review: 84, soApproved: 80, division: 'ITD', department: 'ITD-Infra' },

  // MKT Division (2 apps)
  { label: 'CRM', total: 92, approved: 87, review: 90, soApproved: 88, division: 'MKT', department: 'MKT-Digital' },
  { label: 'MKT-ANALYTICS', total: 90, approved: 86, review: 88, soApproved: 85, division: 'MKT', department: 'MKT-Digital' },

  // RND Division (2 apps)
  { label: 'PROJ-TRACK', total: 94, approved: 89, review: 91, soApproved: 90, division: 'RND', department: 'RND-Labs' },
  { label: 'LAB-SYS', total: 91, approved: 85, review: 88, soApproved: 86, division: 'RND', department: 'RND-Labs' },

  // QAD Division (2 apps)
  { label: 'QMS', total: 84, approved: 79, review: 82, soApproved: 80, division: 'QAD', department: 'QAD-Audit' },
  { label: 'AUDIT-SYS', total: 86, approved: 81, review: 83, soApproved: 81, division: 'QAD', department: 'QAD-Audit' },

  // SCD Division (2 apps)
  { label: 'WMS', total: 79, approved: 74, review: 77, soApproved: 73, division: 'SCD', department: 'SCD-Logistics' },
  { label: 'TMS', total: 81, approved: 76, review: 78, soApproved: 75, division: 'SCD', department: 'SCD-Logistics' },

  // PRD Division (2 apps)
  { label: 'MES', total: 92, approved: 87, review: 90, soApproved: 88, division: 'PRD', department: 'PRD-Ops' },
  { label: 'APS', total: 90, approved: 86, review: 88, soApproved: 85, division: 'PRD', department: 'PRD-Ops' },

  // FIN Division (2 apps)
  { label: 'ERP-FIN', total: 88, approved: 84, review: 86, soApproved: 85, division: 'FIN', department: 'FIN-Accounting' },
  { label: 'BUDGET-TOOL', total: 86, approved: 82, review: 84, soApproved: 83, division: 'FIN', department: 'FIN-Accounting' },

  // LOG Division (2 apps)
  { label: 'LOG-TRACK', total: 84, approved: 79, review: 81, soApproved: 77, division: 'LOG', department: 'LOG-Warehouse' },
  { label: 'INV-MGMT', total: 85, approved: 80, review: 82, soApproved: 78, division: 'LOG', department: 'LOG-Warehouse' },

  // SAD Division (1 app)
  { label: 'SALES-PORTAL', total: 81, approved: 75, review: 80, soApproved: 74, division: 'SAD', department: 'SAD-Sales' },

  // TMD Division (1 app)
  { label: 'TRAINING-HUB', total: 92, approved: 85, review: 89, soApproved: 84, division: 'TMD', department: 'TMD-Training' },

  // CRD Division (1 app)
  { label: 'CORP-PORTAL', total: 86, approved: 81, review: 83, soApproved: 81, division: 'CRD', department: 'CRD-Internal' },

  // EVD Division (1 app)
  { label: 'EVENT-MGMT', total: 95, approved: 89, review: 92, soApproved: 90, division: 'EVD', department: 'EVD-Planning' },

  // BDD Division (1 app)
  { label: 'BI-TOOL', total: 86, approved: 80, review: 85, soApproved: 82, division: 'BDD', department: 'BDD-Analytics' },

  // CMD Division (1 app)
  { label: 'COMM-PLATFORM', total: 84, approved: 78, review: 83, soApproved: 78, division: 'CMD', department: 'CMD-Comms' },

  // SPD Division (1 app)
  { label: 'PROCUREMENT', total: 94, approved: 88, review: 91, soApproved: 92, division: 'SPD', department: 'SPD-Proc' },

  // HSD Division (1 app)
  { label: 'HSE-SYSTEM', total: 96, approved: 90, review: 93, soApproved: 91, division: 'HSD', department: 'HSD-Safety' },

  // OPD Division (1 app)
  { label: 'OPS-DASHBOARD', total: 86, approved: 80, review: 83, soApproved: 80, division: 'OPD', department: 'OPD-Dash' },

  // ASD Division (1 app)
  { label: 'ASSET-TRACKER', total: 93, approved: 87, review: 90, soApproved: 91, division: 'ASD', department: 'ASD-Assets' },

  // CSD Division (1 app)
  { label: 'CUST-SERVICE-SYS', total: 93, approved: 84, review: 88, soApproved: 87, division: 'CSD', department: 'CSD-Support' },
];