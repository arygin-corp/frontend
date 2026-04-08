import { Triggers } from '../models/dar-form.models';

export const PLATFORMS = [
  'API (EIG Application Support)',
  'Cloud (AWS)',
  'Cloud (Azure)',
  'Data Warehouse/Mart (VDW, FDW, FDM, NDW, etc.)',
  'Gateway Access Request (PowerBI, Tableau, Alteryx, etc)',
  'Mainframe (DB2, IMS, CICS, Flat files, Reports, etc.)',
  'My SQL',
  'Oracle (Non-Data Warehouse, MDW, TOMS, Customer Central, etc.)',
  'PostgreSQL',
  'SQL',
  'TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)',
  'Other'
];

export const DOMAINS = [
  { value: 'Customer', label: 'Customer' },
  { value: 'Dealer Identity', label: 'Dealer Identity' },
  { value: 'Dealership', label: 'Dealership' },
  { value: 'Digital Assets', label: 'Digital Assets' },
  { value: 'Enterprise Corporate Applications', label: 'Enterprise Corporate Applications' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Identity Access Management', label: 'Identity Access Management' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Manufacturing Parts', label: 'Manufacturing Parts' },
  { value: 'Product Quality', label: 'Product Quality' },
  { value: 'Research and Development', label: 'Research and Development' },
  { value: 'Service History', label: 'Service History' },
  { value: 'Service Parts and Accessories', label: 'Service Parts and Accessories' },
  { value: 'Telematics', label: 'Telematics' },
  { value: 'Vehicles', label: 'Vehicles' },
  { value: 'Warranty', label: 'Warranty' }
];

export const DATA_WAREHOUSES = [
  'CDW - (Customer Data Warehouse)',
  'FDM - (Finance Data Mart)',
  'FDW - (Finance Data Warehouse)',
  'MDW - (Manufacturing Data Warehouse)',
  'NDW - (North America Parts Operations Data Warehouse)',
  'Other'
];

export const BI_DATA_ACCESS_TYPES = [
  'Alteryx',
  'Other',
  'PowerBI',
  'Tableau'
];

export const ORACLE_ACCESS_TYPES = [
  'Customer Central DB',
  'Other (Non-warehouse)',
  'TOMS – (Toyota Order Management System)'
];

export const MAINFRAME_ACCESS_TYPES = [
  'ChangeMan Approval Authority',
  'CICS Access',
  'DB2 Plan Access',
  'DB2 Table Access',
  'IMS Access',
  'Mainframe Dataset/File Access',
  'Mainframe Report Access',
  'Mainframe Service Account',
  'Mainframe TSO ID',
  'MQ Access',
  'TWS/OPC Scheduling Access',
  'Other'
];

export const MAINFRAME_MANUFACTURING_SYSTEMS = [
  'ALC (uses IMS screen EKBM)',
  'Buy-off',
  'Cost Master',
  'eKanban',
  'Endevor Approver',
  'e-Pay',
  'FTZ',
  'Individual Vehicle NQC (IVE or IVERQST)',
  'IS Developers',
  'IS Users',
  'IVE / IVNQC / IVEGRP',
  'Overseas Part Orders',
  'Overseas Pipeline',
  'OSS - Outbound Shipping',
  'OWK - One-way Kanban',
  'PC Reports / Online Viewer',
  'Physical Inventory',
  'Price Master',
  'Regional Scrap',
  'Salitem',
  'Scrap',
  'Supplier Master',
  'Other'
];

export const MANUFACTURING_LOCATIONS = [
  'TABC - Toyota Auto Body Corporation, Inc. (Long Beach, California)',
  'TAPG - Toyota Arizona Proving Grounds (Wickenburg, Arizona)',
  'TMMAL – Toyota Motor Manufacturing (Huntsville, Alabama)',
  'TMMBC - Toyota Motor Manufacturing de Baja California (Baja California, Mexico)',
  'TMMC - Toyota Motor Manufacturing Canada - Cambridge (Cambridge, Ontario, Canada)',
  'TMMCW - Toyota Motor Manufacturing Canada INC. (Woodstock, Ontario, Canada)',
  'TMMGT - Toyota Motor Manufacturing de Guanajuato (Guanajuato, Mexico)',
  'TMMI - Toyota Motor Manufacturing, Indiana (Princeton, Indiana)',
  'TMMK - Toyota Motor Manufacturing, Kentucky (Georgetown, Kentucky)',
  'TMMMS - Toyota Motor Manufacturing Mississippi (Blue Springs, Mississippi)',
  'TMMTX - Toyota Motor Manufacturing, Texas (San Antonio, Texas)',
  'TMMWV - Toyota Motor Manufacturing, West Virginia, Inc. (Buffalo, West Virginia)',
  'TMNA - Toyota Motor North America',
  'MTMUS - Mazda Toyota Manufacturing U.S.A., Inc.',
  'Other'
];

export const ENVIRONMENTS = {
  DEFAULT: ['QA', 'Dev', 'Prod', 'All'],
  CICS: [
    'CICSP - Production',
    'CICST - TEST',
    'CICSTA - TESTA',
    'CICSTB - TESTB',
    'CICSTC - TESTC',
    'CICSTD - TESTD',
    'CICSTE - TESTE',
    'CICSTF - TESTF',
    'CICSTG - TESTG',
    'CICSTH - TESTH',
    'CICSTJ - TESTJ',
    'CICSTK - TESTK',
    'All'
  ],
  DB2: [
    'PDB2 - Production',
    'TDB2 - TEST',
    'DB2A - TESTA',
    'DB2B - TESTB',
    'DB2C - TESTC',
    'DB2D - TESTD',
    'DB2E - TESTE',
    'DB2F - TESTF',
    'DB2G - TESTG',
    'DB2H - TESTH',
    'DB2I - TESTI',
    'DB2J - TESTJ',
    'DB2K - TESTK',
    'All'
  ],
  IMS: [
    'IMSP - Production',
    'IMST - TEST',
    'IMSTA - TESTA',
    'IMSTB - TESTB',
    'IMSTC - TESTC',
    'IMSTD - TESTD',
    'IMSTE - TESTE',
    'IMSTF - TESTF',
    'IMSTG - TESTG',
    'IMSTH - TESTH',
    'IMSTJ - TESTJ',
    'IMSTK - TESTK',
    'All'
  ]
};

export const DATA_ACCESS_TYPES = [
  'read',
  'modify',
  'insert',
  'update',
  'delete',
  'privileged',
  'na'
];

export const FLATFILE_ACCESS_LEVELS = [
  'Read',
  'Write',
  'Create/Delete'
];

export const YES_NO = ['Yes', 'No'];

/* ------------------------------------------------------------------
   TRIGGERS mapping (declarative): control -> value -> targets (control+label+validators)
   Keep this near the helper constants for convenience.
   ------------------------------------------------------------------ */
export const TRIGGERS: Triggers = [
  {
    control: 'requesting_id',
    conditions: [
      {
        value: 'User',
        targets: [
          { control: 'v_dar_objectid_reqfor', label: 'Search for the user needing access', validators: ['required'] }
        ]
      },
      {
        value: 'Me',
        targets: [
          { control: 'v_dar_objectid_reqfor', label: 'Workday ID of the person needing access', validators: ['required'] }
        ]
      }
    ]
  },
  {
    control: 'v_dar_platform',
    conditions: [
      {
        value: 'API (EIG Application Support)',
        targets: [
          { control: 'v_dat_api_name', label: 'API Name', validators: ['required'] },
          { control: 'v_dat_data_access_type', label: 'Data Access Type', validators: ['required'] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'My SQL',
        targets: [
          { control: 'v_dar_post_database_schema', label: 'Database/Schema', validators: ['required'] },
          { control: 'v_dar_post_table_names', label: 'Table Name(s)', validators: ['required'] },
          { control: 'v_dat_data_access_type', label: 'Data Access Type', validators: ['required'] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'PostgreSQL',
        targets: [
          { control: 'v_dar_post_database_schema', label: 'Database/Schema', validators: ['required'] },
          { control: 'v_dar_post_table_names', label: 'Table Name(s)', validators: ['required'] },
          { control: 'v_dat_data_access_type', label: 'Data Access Type', validators: ['required'] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'SQL',
        targets: [
          { control: 'v_dar_post_database_schema', label: 'Database/Schema', validators: ['required'] },
          { control: 'v_dar_post_table_names', label: 'Table Name(s)', validators: ['required'] },
          { control: 'v_dat_data_access_type', label: 'Data Access Type', validators: ['required'] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)',
        targets: [
          { control: 'v_dar_post_database_schema', label: 'Database/Schema', validators: ['required'] },
          { control: 'v_dar_post_table_names', label: 'Table Name(s)', validators: ['required'] },
          { control: 'v_dat_data_access_type', label: 'Data Access Type', validators: ['required'] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'Other',
        targets: [
          { control: 'v_dar_OtherType', label: 'If other, please specify', validators: ['required'] },
          { control: 'v_dat_data_access_type', label: 'Data Access Type', validators: ['required'] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'Data Warehouse/Mart (VDW, FDW, FDM, NDW, etc.)',
        targets: [
          { control: 'v_dar_select_a_data_warehouse_mart', label: 'Select a Data Warehouse/Mart', validators: ['required'] },
          { control: 'v_dat_data_access_type', label: 'Data Access Type', validators: ['required'] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'Gateway Access Request (PowerBI, Tableau, Alteryx, etc)',
        targets: [
          { control: 'v_dar_bi_data_access_type', label: 'BI data access type', validators: ['required'] },
          { control: 'v_dar_gateway_database_schema', label: 'Database/Schema', validators: ['required'] },
          { control: 'v_dat_data_access_type', label: 'Data Access Type', validators: ['required'] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'Oracle (Non-Data Warehouse, MDW, TOMS, Customer Central, etc.)',
        targets: [
          { control: 'v_dar_select_an_oracle_access_type', label: 'Select Oracle access type', validators: ['required'] },
          { control: 'v_dat_data_access_type', label: 'Data Access Type', validators: ['required'] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'Cloud (AWS)',
        targets: [{ control: 'v_dar_environment', label: 'Environment', validators: ['required'] }]
      },
      {
        value: 'Cloud (Azure)',
        targets: [{ control: 'v_dar_environment', label: 'Environment', validators: ['required'] }]
      },
      {
        value: 'Mainframe (DB2, IMS, CICS, Flat files, Reports, etc.)',
        targets: [{ control: 'v_dar_mainframe_access_type', label: 'Mainframe access type', validators: ['required'] }]
      },
      {
        value: 'My SQL',
        targets: []
      }
    ]
  },
  {
    control: 'v_dar_bi_data_access_type',
    conditions: [
      {
        value: 'Other',
        targets: [{ control: 'v_dar_gateway_if_other', label: 'If other, please specify', validators: ['required'] }]
      }
    ]
  },
  {
    control: 'v_dar_select_an_oracle_access_type',
    conditions: [
      {
        value: 'Other (Non-warehouse)',
        targets: [{ control: 'v_dar_oracle_other', label: 'If other, please specify', validators: ['required'] }]
      }
    ]
  },
  {
    control: 'v_dar_dataDomainSelect',
    conditions: [
      {
        value: 'Customer',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Dealer Identity',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Dealership',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Digital Assets',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Finance',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Identity Access Management',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Manufacturing',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Manufacturing Parts',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Product Quality',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Research and Development',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Service History',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Service Parts and Accessories',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Telematics',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Vehicles',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      },
      {
        value: 'Warranty',
        targets: [{ control: 'v_custom_control_group', label: 'Control Group', validators: [] }]
      }
    ]
  },
  {
    control: 'v_dar_mainframe_access_type',
    conditions: [
      {
        value: 'ChangeMan Approval Authority',
        targets: [
          { control: 'v_dar_changeman_add_delete', label: 'Add or Remove', validators: ['required'] },
          { control: 'v_dar_mainframe_change_tso_id', label: 'TSO ID', validators: ['required'] },
          { control: 'v_dar_mainframe_changeman_application', label: 'ChangeMan Application', validators: ['required'] },
          { control: 'v_dare_mainframe_change_authorizers_vertical_horizontal', label: 'Approval Level', validators: ['required'] }
        ]
      },
      {
        value: 'CICS Access',
        targets: [
          { control: 'v_dar_cics_add_delete', label: 'Add or Delete (CICS Access)', validators: ['required'] },
          { control: 'v_dar_mf_tso_id_removed', label: 'TSO ID', validators: ['required'] },
          { control: 'v_dar_mf_transaction', label: 'CICS Transaction/Program', validators: ['required'] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'DB2 Plan Access',
        targets: [
          { control: 'v_dar_mf_db2_plan_tso_id_or_job_name', label: 'TSO ID (Plan)', validators: ['required'] },
          { control: 'v_dar_mf_db2_plan_plan_name', label: 'Plan Name', validators: ['required'] },
          { control: 'b_dar_mf_db2_plan_grant', label: 'Grant', validators: [] },
          { control: 'b_dar_mf_db2_plan_revoke', label: 'Revoke', validators: [] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'DB2 Table Access',
        targets: [
          { control: 'v_dar_mf_db2_tso_or_job_name', label: 'TSO ID', validators: ['required'] },
          { control: 'v_dar_mf_db2_table_name_s', label: 'Table Name (schema.table)', validators: ['required'] },
          { control: 'b_dar_mf_db2_select', label: 'Select', validators: [] },
          { control: 'b_dar_mf_db2_update', label: 'Update', validators: [] },
          { control: 'b_dar_mf_db2_insert', label: 'Insert', validators: [] },
          { control: 'b_dar_mf_db2_delete', label: 'Delete', validators: [] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'IMS Access',
        targets: [
          { control: 'v_dar_mnfr_ims_options_select', label: 'Add or Delete (IMS)', validators: ['required'] },
          { control: 'v_dar_mf_ims_ims_id', label: 'IMS ID', validators: ['required'] },
          { control: 'v_dar_mf_ims_tmna_region_area_code_for_adds', label: 'Region/Area Code', validators: [] },
          { control: 'v_dar_mf_ims_transaction_group', label: 'Transaction Group', validators: [] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'Mainframe Dataset/File Access',
        targets: [
          { control: 'v_dar_mfr_dataset_file_access_add_delete', label: 'Add or Remove', validators: ['required'] },
          { control: 'v_dar_mainframe_file_set_name', label: 'Dataset/File Name', validators: ['required'] },
          { control: 'v_dar_mainframe_file_tso_id', label: 'List the TSO IDs, Jobs, Project Area Codes...', validators: ['required'] },
          { control: 'v_dat_data_access_type_flat', label: 'Access Level', validators: ['required'] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'Mainframe Report Access',
        targets: [
          { control: 'v_dar_mf_rep_grant_or_revoke', label: 'Add or Delete', validators: ['required'] },
          { control: 'v_dar_mf_report_id_s_being_requested', label: 'Report ID', validators: [] },
          { control: 'v_dar_mf_rep_list_tso_id_or_project_area_group', label: 'List the TSO IDs', validators: [] },
          { control: 'v_dar_environment', label: 'Environment', validators: ['required'] }
        ]
      },
      {
        value: 'Mainframe Service Account',
        targets: [
          { control: 'v_dar_mfr_service_account_add_delete', label: 'Add or Delete', validators: ['required'] },
          { control: 'v_dar_mainframe_service_id_to_be_added', label: 'Service Account Name/ID', validators: ['required'] },
          { control: 'v_dar_service_account_desc', label: 'Service Account Description', validators: ['required'] },
          { control: 'v_dar_service_account_owner', label: 'Service Account Owner', validators: ['required'] },
          { control: 'v_dar_service_account_default_racf_grp', label: 'Service Account Default RACF Group', validators: ['required'] }
        ]
      },
      {
        value: 'TWS/OPC Scheduling Access',
        targets: [
          { control: 'v_dar_tws_opc_scheduling_add_remove', label: 'Add or Remove (TWS/OPC)', validators: ['required'] },
          { control: 'v_dar_mainframe_TWS_tso_id', label: 'TWS TSO ID', validators: ['required'] },
          { control: 'v_dar_mainframe_TWS_access_group', label: 'TWS Access Group', validators: ['required'] }
        ]
      },
      {
        value: 'Other',
        targets: [{ control: 'v_dar_mfr_other', label: 'If other, please specify', validators: ['required'] }]
      }
    ]
  },
  {
    control: 'v_dar_mfr_dataset_file_access_add_delete',
    conditions: [
      {
        value: 'Grant Access to a Dataset/File',
        targets: [
          { control: 'v_dar_mainframe_file_set_name', label: 'Dataset/File Name', validators: ['required'] },
          { control: 'v_dar_mainframe_file_tso_id', label: 'List the TSO IDs...', validators: ['required'] }
        ]
      },
      {
        value: 'Remove Access to a Dataset/File',
        targets: [
          { control: 'v_dar_mainframe_file_set_name', label: 'Dataset/File Name', validators: ['required'] },
          { control: 'v_dar_mainframe_file_tso_id', label: 'List the TSO IDs...', validators: ['required'] }
        ]
      }
    ]
  },
  {
    control: 'v_dar_mfr_service_account_add_delete',
    conditions: [
      {
        value: 'Add New Service Account',
        targets: [
          { control: 'v_dar_mainframe_service_id_to_be_added', label: 'Service Account Name/ID', validators: ['required'] },
          { control: 'v_dar_service_account_desc', label: 'Service Account Description', validators: ['required'] },
          { control: 'v_dar_service_account_owner', label: 'Service Account Owner', validators: ['required'] },
          { control: 'v_dar_service_account_default_racf_grp', label: 'Service Account Default RACF Group', validators: ['required'] }
        ]
      },
      {
        value: 'Remove Service Account',
        targets: [{ control: 'v_dar_mainframe_service_id_to_be_added', label: 'Service Account Name/ID', validators: ['required'] }]
      }
    ]
  },
  {
    control: 'v_dar_mfr_tso_id_add_delete',
    conditions: [
      {
        value: 'Remove TSO ID',
        targets: [{ control: 'v_dar_mfr_tso_id', label: 'TSO ID', validators: ['required'] }]
      },
      {
        value: 'Add TSO ID',
        targets: [
          { control: 'v_dar_service_account_to_model', label: 'Service Account Model', validators: [] },
          { control: 'v_dar_mfr_tso_id_default_racf_grp', label: 'Default RACF Group', validators: [] }
        ]
      }
    ]
  },
  {
    control: 'v_dar_mnfr_ims_options_select',
    conditions: [
      {
        value: 'Add IMS Access',
        targets: [
          { control: 'v_dar_mf_ims_ims_id', label: 'IMS ID', validators: ['required'] },
          { control: 'v_dar_mf_ims_tmna_region_area_code_for_adds', label: 'Region/Area Code', validators: [] },
          { control: 'v_dar_mf_ims_transaction_group', label: 'Transaction Group', validators: [] }
        ]
      },
      {
        value: 'Remove IMS Access',
        targets: [{ control: 'v_dar_mf_ims_ims_id', label: 'IMS ID', validators: ['required'] }]
      }
    ]
  },
  {
    control: 'v_dar_mf_what_location',
    conditions: [
      {
        value: 'Other',
        targets: [{ control: 'v_dar_mf_loc_if_other', label: 'If Other, please specify', validators: ['required'] }]
      }
    ]
  },
  {
    control: 'v_dar_accessReqClassification',
    conditions: [
      {
        value: 'Confidential',
        targets: [
          { control: 'edm_PI_personal_details', label: 'PI Personal Details', validators: ['required'] },
          { control: 'v_emd_PI_access', label: 'Sensitive PI Access', validators: ['required'] },
          { control: 'v_edm_type_of_work', label: 'Type of Work', validators: ['required'] },
          { control: 'v_edm_3rd_party_vendor', label: '3rd Party Vendor', validators: ['required'] }
        ]
      },
      {
        value: 'Highly Confidential',
        targets: [
          { control: 'edm_PI_personal_details', label: 'PI Personal Details', validators: ['required'] },
          { control: 'v_emd_PI_access', label: 'Sensitive PI Access', validators: ['required'] },
          { control: 'v_edm_type_of_work', label: 'Type of Work', validators: ['required'] },
          { control: 'v_edm_3rd_party_vendor', label: '3rd Party Vendor', validators: ['required'] }
        ]
      },
      {
        value: 'Personal Information',
        targets: [
          { control: 'edm_PI_personal_details', label: 'PI Personal Details', validators: ['required'] },
          { control: 'v_emd_PI_access', label: 'Sensitive PI Access', validators: ['required'] },
          { control: 'v_edm_type_of_work', label: 'Type of Work', validators: ['required'] },
          { control: 'v_edm_3rd_party_vendor', label: '3rd Party Vendor', validators: ['required'] }
        ]
      },
      {
        value: 'Legal/Privileged',
        targets: [
          { control: 'edm_PI_personal_details', label: 'PI Personal Details', validators: ['required'] },
          { control: 'v_emd_PI_access', label: 'Sensitive PI Access', validators: ['required'] },
          { control: 'v_edm_type_of_work', label: 'Type of Work', validators: ['required'] },
          { control: 'v_edm_3rd_party_vendor', label: '3rd Party Vendor', validators: ['required'] }
        ]
      }
    ]
  },
  {
    control: 'v_emd_PI_access',
    conditions: [
      {
        value: 'Yes',
        targets: [
          { control: 'edm_PI_personal_details', label: 'Do you need access to personal details', validators: ['required'] },
          { control: 'v_edm_type_of_work', label: 'Type of Work', validators: ['required'] },
          { control: 'v_edm_3rd_party_vendor', label: 'Is data shared with 3rd Party', validators: ['required'] }
        ]
      }
    ]
  },
  {
    control: 'edm_PI_personal_details',
    conditions: [
      {
        value: 'Yes',
        targets: [
          { control: 'v_emd_specify_PII_needs', label: 'Please specify PII needs', validators: ['required', 'minLength10'] }
        ]
      }
    ]
  }
];