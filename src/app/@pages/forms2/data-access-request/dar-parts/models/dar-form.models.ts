import { FormGroup, FormControl } from '@angular/forms';

export interface TriggerTarget {
  control: string;
  label: string;
  validators?: string[];
}

export interface TriggerCondition {
  value: string;
  targets: TriggerTarget[];
}

export interface TriggerMap {
  control: string;
  conditions: TriggerCondition[];
}

export type Triggers = TriggerMap[];

export function createMasterDarForm(): FormGroup {
  return new FormGroup({
    requesting_id: new FormControl('Me'),
    v_dar_objectid_reqfor: new FormControl(null),
    v_dar_objectid_createdby: new FormControl(null),
    v_dar_dm_version: new FormControl(null),
    v_dar_platform: new FormControl(null),
    v_dat_api_name: new FormControl(null),
    v_dat_data_access_type: new FormControl(null),
    v_dat_data_access_type_flat: new FormControl(null),
    v_dar_environment: new FormControl(null),
    v_dar_post_database_schema: new FormControl(null),
    v_dar_post_table_names: new FormControl(null),
    v_dar_select_a_data_warehouse_mart: new FormControl(null),
    v_dar_bi_data_access_type: new FormControl(null),
    v_dar_gateway_if_other: new FormControl(null),
    v_dar_gateway_database_schema: new FormControl(null),
    v_dar_select_an_oracle_access_type: new FormControl(null),
    v_dar_oracle_other: new FormControl(null),
    v_dar_OtherType: new FormControl(null),
    v_dar_mainframe_access_type: new FormControl(null),
    v_dar_changeman_add_delete: new FormControl(null),
    v_dar_mainframe_change_tso_id: new FormControl(null),
    v_dare_mainframe_change_authorizers_vertical_horizontal: new FormControl(null),
    v_dar_mainframe_changeman_application: new FormControl(null),
    v_dar_cics_add_delete: new FormControl(null),
    v_dar_mf_tso_id_removed: new FormControl(null),
    v_dar_mf_transaction: new FormControl(null),
    v_dar_mfr_dataset_file_access_add_delete: new FormControl(null),
    v_dar_mainframe_file_set_name: new FormControl(null),
    v_dar_mainframe_file_tso_id: new FormControl(null),
    v_dar_mf_rep_grant_or_revoke: new FormControl(null),
    v_dar_mf_report_id_s_being_requested: new FormControl(null),
    v_dar_mf_rep_list_tso_id_or_project_area_group: new FormControl(null),
    v_dar_mfr_service_account_add_delete: new FormControl(null),
    v_dar_mainframe_service_id_to_be_added: new FormControl(null),
    v_dar_service_account_desc: new FormControl(null),
    v_dar_service_account_owner: new FormControl(null),
    v_dar_service_account_default_racf_grp: new FormControl(null),
    v_dar_tws_opc_scheduling_add_remove: new FormControl(null),
    v_dar_mainframe_TWS_tso_id: new FormControl(null),
    v_dar_mainframe_TWS_access_group: new FormControl(null),
    v_dar_mf_db2_plan_tso_id_or_job_name: new FormControl(null),
    v_dar_mf_db2_plan_plan_name: new FormControl(null),
    b_dar_mf_db2_plan_grant: new FormControl(null),
    b_dar_mf_db2_plan_revoke: new FormControl(null),
    v_dar_mf_db2_tso_or_job_name: new FormControl(null),
    v_dar_mf_db2_table_name_s: new FormControl(null),
    b_dar_mf_db2_select: new FormControl(null),
    b_dar_mf_db2_update: new FormControl(null),
    b_dar_mf_db2_insert: new FormControl(null),
    b_dar_mf_db2_delete: new FormControl(null),
    edm_PI_personal_details: new FormControl(null),
    v_emd_specify_PII_needs: new FormControl(null),
    v_edm_type_of_work: new FormControl(null),
    v_edm_3rd_party_vendor: new FormControl(null),
    v_emd_PI_access: new FormControl(null),
    v_dar_dataDomainSelect: new FormControl(null),
    v_custom_control_group: new FormControl(null),
    v_dar_mf_mq_explorer: new FormControl(null),
    v_dar_mf_queue_manager: new FormControl(null),
    v_dar_mf_message_queue: new FormControl(null),
    v_dar_mfr_other: new FormControl(null),
    v_dar_mf_loc_if_other: new FormControl(null),
    companyName: new FormControl(null),
    v_dar_organization: new FormControl(null),
    v_dar_DataReqDescription: new FormControl(null),
    v_dar_businessJustification: new FormControl(null),
    chk_dar_terms_message: new FormControl(null),
    // common metadata fields
    v_dar_requested_by: new FormControl(null),
    v_dar_request_date: new FormControl(null),
    v_dar_priority: new FormControl(null),
    // Add other controls referenced in templates/rules as needed
    v_dar_accessType: new FormControl('User Requested Access (Individual is directly accessing the data)'),
    v_dar_userType: new FormControl('TMNA User'),
  });
}