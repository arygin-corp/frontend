// validation-status.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-validation-status',
  templateUrl: './validation-status.component.html',
  styleUrls: ['./validation-status.component.scss']
})
export class ValidationStatusComponent implements OnChanges {
  @Input() form!: FormGroup;

  requiredControls: { name: string; label: string; valid: boolean }[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.form && this.form) {
      this.rebuildList();
      // Also listen for value/validator changes to update list live
      this.form.valueChanges.subscribe(() => this.rebuildList());
    }
  }

  private rebuildList() {
    // Clear and rebuild
    const controls = this.form ? Object.keys(this.form.controls) : [];
    const out: { name: string; label: string; valid: boolean }[] = [];

    controls.forEach(key => {
      const control = this.form.get(key) as FormControl | null;
      if (!control) return;

      // Determine whether this control is 'required' by testing its validators
      let isRequired = false;
      if (control.validator) {
        // Create a temporary control with empty value to test required
        const test = new FormControl(null);
        const res = control.validator(test as any);
        if (res && res.required) {
          isRequired = true;
        }
      }

      if (isRequired) {
        const label = this.humanizeLabel(key);
        const valid = control.valid;
        out.push({ name: key, label, valid });
      }
    });

    this.requiredControls = out;
  }

  private humanizeLabel(key: string) {
    // Map common control names to user-friendly labels (extend as needed)
    const mapping: { [k: string]: string } = {
      requesting_id: 'Requested For',
      v_dar_objectid_reqfor: 'Requested Person Workday ID',
      v_dar_platform: 'Platform',
      v_dar_dataDomainSelect: 'Data Domain',
      v_dat_api_name: 'API Name',
      v_dar_post_database_schema: 'Database / Schema',
      v_dar_post_table_names: 'Table Name(s)',
      v_dar_select_a_data_warehouse_mart: 'Data Warehouse/Mart',
      v_dar_bi_data_access_type: 'BI data access type',
      v_dar_gateway_database_schema: 'Gateway Database/Schema',
      v_dar_select_an_oracle_access_type: 'Oracle Access Type',
      v_dar_oracle_other: 'Oracle Other',
      v_dar_mainframe_access_type: 'Mainframe Access Type',
      v_dar_mf_db2_plan_tso_id_or_job_name: 'DB2 Plan TSO ID',
      v_dar_mf_db2_plan_plan_name: 'DB2 Plan Name',
      v_dar_mf_db2_table_name_s: 'DB2 Table Name(s)',
      v_dar_DataReqDescription: 'Request Description',
      v_dar_businessJustification: 'Intended Use',
      v_emd_PI_access: 'Sensitive PI',
      chk_dar_terms_message: 'Terms of Use'
    };
    return mapping[key] || this.splitCamel(key);
  }

  private splitCamel(str: string) {
    // fallback label generator
    return str.replace(/_/g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/\b\w/g, l => l.toUpperCase());
  }
}