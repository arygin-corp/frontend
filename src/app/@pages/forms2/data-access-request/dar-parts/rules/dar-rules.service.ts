import { Injectable } from '@angular/core';
import { Validators, FormGroup, AbstractControl } from '@angular/forms';
import {
  PLATFORMS,
  DATA_WAREHOUSES,
  BI_DATA_ACCESS_TYPES,
  ORACLE_ACCESS_TYPES,
  MAINFRAME_ACCESS_TYPES,
  MAINFRAME_MANUFACTURING_SYSTEMS,
  MANUFACTURING_LOCATIONS,
  ENVIRONMENTS,
  DATA_ACCESS_TYPES,
  FLATFILE_ACCESS_LEVELS,
} from '../helper/dar-form-helper';

@Injectable({
  providedIn: 'root'
})
export class DarRulesService {
  constructor() { }

  private setValidators(ctrl: AbstractControl | null, validators: any[] | null) {
    if (!ctrl) return;
    if (validators && validators.length) {
      ctrl.setValidators(validators);
    } else {
      ctrl.clearValidators();
    }
    ctrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
  }

  applyPlatformRules(form: FormGroup) {
    const plat = form.get('v_dar_platform')?.value;
    const apiCtrl = form.get('v_dat_api_name');
    const dbSchemaCtrl = form.get('v_dar_post_database_schema');
    const tableNamesCtrl = form.get('v_dar_post_table_names');
    const dwCtrl = form.get('v_dar_select_a_data_warehouse_mart');
    const biTypeCtrl = form.get('v_dar_bi_data_access_type');
    const gwIfOtherCtrl = form.get('v_dar_gateway_if_other');
    const gwSchemaCtrl = form.get('v_dar_gateway_database_schema');
    const oracleTypeCtrl = form.get('v_dar_select_an_oracle_access_type');
    const oracleOtherCtrl = form.get('v_dar_oracle_other');
    const otherPlatformCtrl = form.get('v_dar_OtherType');
    const envCtrl = form.get('v_dar_environment');

    this.setValidators(apiCtrl, null);
    this.setValidators(dbSchemaCtrl, null);
    this.setValidators(tableNamesCtrl, null);
    this.setValidators(dwCtrl, null);
    this.setValidators(biTypeCtrl, null);
    this.setValidators(gwIfOtherCtrl, null);
    this.setValidators(gwSchemaCtrl, null);
    this.setValidators(oracleTypeCtrl, null);
    this.setValidators(oracleOtherCtrl, null);
    this.setValidators(otherPlatformCtrl, null);
    this.setValidators(envCtrl, null);

    if (plat === 'API (EIG Application Support)') {
      this.setValidators(apiCtrl, [Validators.required]);
      this.setValidators(envCtrl, [Validators.required]);
      this.setValidators(form.get('v_dat_data_access_type'), [Validators.required]);
    }

    if (plat === 'My SQL' || plat === 'PostgreSQL' || plat === 'SQL') {
      this.setValidators(dbSchemaCtrl, [Validators.required]);
      this.setValidators(tableNamesCtrl, [Validators.required]);
      this.setValidators(form.get('v_dat_data_access_type'), [Validators.required]);
      this.setValidators(envCtrl, [Validators.required]);
    }

    if (plat === 'TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)') {
      this.setValidators(dbSchemaCtrl, [Validators.required]);
      this.setValidators(tableNamesCtrl, [Validators.required]);
      this.setValidators(form.get('v_dat_data_access_type'), [Validators.required]);
      this.setValidators(envCtrl, [Validators.required]);
    }

    if (plat === 'Other') {
      this.setValidators(otherPlatformCtrl, [Validators.required]);
      this.setValidators(form.get('v_dat_data_access_type'), [Validators.required]);
      this.setValidators(envCtrl, [Validators.required]);
    }

    if (plat === 'Data Warehouse/Mart (VDW, FDW, FDM, NDW, etc.)') {
      this.setValidators(dwCtrl, [Validators.required]);
      this.setValidators(form.get('v_dat_data_access_type'), [Validators.required]);
      this.setValidators(envCtrl, [Validators.required]);
    }

    if (plat === 'Gateway Access Request (PowerBI, Tableau, Alteryx, etc)') {
      this.setValidators(biTypeCtrl, [Validators.required]);
      this.setValidators(gwSchemaCtrl, [Validators.required]);
      this.setValidators(form.get('v_dat_data_access_type'), [Validators.required]);
      this.setValidators(envCtrl, [Validators.required]);
      this.applyGatewayOtherRule(form);
    }

    if (plat === 'Oracle (Non-Data Warehouse, MDW, TOMS, Customer Central, etc.)') {
      this.setValidators(oracleTypeCtrl, [Validators.required]);
      this.setValidators(form.get('v_dat_data_access_type'), [Validators.required]);
      this.setValidators(envCtrl, [Validators.required]);
      this.applyOracleOtherRule(form);
    }

    if (plat === 'Cloud (AWS)' || plat === 'Cloud (Azure)') {
      this.setValidators(envCtrl, [Validators.required]);
    }

    if (plat === 'Mainframe (DB2, IMS, CICS, Flat files, Reports, etc.)') {
      this.applyMainframeRules(form);
    }
  }

  applyGatewayOtherRule(form: FormGroup) {
    const biType = form.get('v_dar_bi_data_access_type')?.value;
    const gwIfOtherCtrl = form.get('v_dar_gateway_if_other');
    if (biType === 'Other') {
      this.setValidators(gwIfOtherCtrl, [Validators.required]);
    } else {
      this.setValidators(gwIfOtherCtrl, null);
    }
  }

  applyOracleOtherRule(form: FormGroup) {
    const oracleType = form.get('v_dar_select_an_oracle_access_type')?.value;
    const oracleOtherCtrl = form.get('v_dar_oracle_other');
    if (oracleType === 'Other (Non-warehouse)') {
      this.setValidators(oracleOtherCtrl, [Validators.required]);
    } else {
      this.setValidators(oracleOtherCtrl, null);
    }
  }

  applyMainframeRules(form: FormGroup) {
    const mainType = form.get('v_dar_mainframe_access_type')?.value;
    const envCtrl = form.get('v_dar_environment');
    const cicsAddDelete = form.get('v_dar_cics_add_delete');
    const changeManAddDelete = form.get('v_dar_changeman_add_delete');
    const fileAddDelete = form.get('v_dar_mfr_dataset_file_access_add_delete');
    const serviceAccountAddDelete = form.get('v_dar_mfr_service_account_add_delete');
    const mfrTsoAddDelete = form.get('v_dar_mfr_tso_id_add_delete');
    const mqExplorer = form.get('v_dar_mf_mq_explorer');
    const queueManager = form.get('v_dar_mf_queue_manager');
    const messageQueue = form.get('v_dar_mf_message_queue');
    const dataAccessFlat = form.get('v_dat_data_access_type_flat');

    this.setValidators(envCtrl, null);
    this.setValidators(cicsAddDelete, null);
    this.setValidators(changeManAddDelete, null);
    this.setValidators(fileAddDelete, null);
    this.setValidators(serviceAccountAddDelete, null);
    this.setValidators(mfrTsoAddDelete, null);
    this.setValidators(mqExplorer, null);
    this.setValidators(queueManager, null);
    this.setValidators(messageQueue, null);
    this.setValidators(dataAccessFlat, null);

    if (mainType === 'CICS Access') {
      this.setValidators(cicsAddDelete, [Validators.required]);
      this.setValidators(envCtrl, [Validators.required]);
    }

    if (mainType === 'ChangeMan Approval Authority') {
      this.setValidators(changeManAddDelete, [Validators.required]);
      this.setValidators(form.get('v_dar_mainframe_change_tso_id'), [Validators.required]);
      this.setValidators(form.get('v_dare_mainframe_change_authorizers_vertical_horizontal'), [Validators.required]);
      this.setValidators(form.get('v_dar_mainframe_changeman_application'), [Validators.required]);
    }

    if (mainType === 'Mainframe Flat File Access') {
      this.setValidators(fileAddDelete, [Validators.required]);
      this.setValidators(dataAccessFlat, [Validators.required]);
    }

    if (mainType === 'Mainframe Report Access') {
      this.setValidators(form.get('v_dar_mf_rep_grant_or_revoke'), [Validators.required]);
    }

    if (mainType === 'MQ Access') {
      this.setValidators(mqExplorer, [Validators.required]);
      this.setValidators(queueManager, [Validators.required]);
      this.setValidators(messageQueue, [Validators.required]);
      this.setValidators(form.get('v_dar_mf_tso_id_removed'), [Validators.required]);
    }

    if (mainType === 'Mainframe Service Account') {
      this.setValidators(serviceAccountAddDelete, [Validators.required]);
    }

    if (mainType === 'Mainframe TSO ID') {
      this.setValidators(mfrTsoAddDelete, [Validators.required]);
    }

    if (mainType === 'DB2 Plan Access') {
      this.setValidators(form.get('v_dar_mf_db2_plan_tso_id_or_job_name'), [Validators.required]);
      this.setValidators(form.get('v_dar_mf_db2_plan_plan_name'), [Validators.required]);
      this.setValidators(envCtrl, [Validators.required]);
    }

    if (mainType === 'DB2 Table Access') {
      this.setValidators(form.get('v_dar_mf_db2_tso_or_job_name'), [Validators.required]);
      this.setValidators(form.get('v_dar_mf_db2_table_name_s'), [Validators.required]);
      this.setValidators(envCtrl, [Validators.required]);
    }
  }

  applyDomainRules(form: FormGroup) {
    const domain = form.get('v_dar_dataDomainSelect')?.value;
    const dataAccessCtrl = form.get('v_dat_data_access_type');
    const envCtrl = form.get('v_dar_environment');

    if (domain && domain !== '') {
      this.setValidators(dataAccessCtrl, [Validators.required]);
      this.setValidators(envCtrl, [Validators.required]);
    } else {
      this.setValidators(dataAccessCtrl, null);
      this.setValidators(envCtrl, null);
    }
  }

  applySecurityRules(form: FormGroup, value: string) {
    const piidetails = form.get('edm_PI_personal_details');
    const piineeds = form.get('v_emd_specify_PII_needs');
    const worktype = form.get('v_edm_type_of_work');
    const vendor = form.get('v_edm_3rd_party_vendor');

    if (value === 'Yes') {
      this.setValidators(piidetails, [Validators.required]);
      this.setValidators(worktype, [Validators.required]);
      this.setValidators(vendor, [Validators.required]);
    } else {
      this.setValidators(piidetails, null);
      this.setValidators(piineeds, null);
      this.setValidators(worktype, null);
      this.setValidators(vendor, null);
    }

    if (piidetails?.value === 'Yes') {
      this.setValidators(piineeds, [Validators.required, Validators.minLength(10)]);
    } else {
      this.setValidators(piineeds, null);
    }
  }
}