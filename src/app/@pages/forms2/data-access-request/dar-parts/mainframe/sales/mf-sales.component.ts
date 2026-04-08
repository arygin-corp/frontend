// Summary: Controls Corporate-specific mainframe logic: ChangeMan, CICS, and Sales DB2 Routing.

import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-mf-sales',
  template: `
    <div [formGroup]="parentForm" class="p-3 border-start border-4 border-danger rounded mb-3">
      <h6 class="text-danger fw-bold">SALES MAINFRAME OPTIONS</h6>
      <div class="form-floating mb-3">
        <select class="form-select" formControlName="v_dar_mainframe_access_type">
          <option value="ChangeMan Approval Authority">ChangeMan Authority</option>
          <option value="CICS Access">CICS Access</option>
          <option value="MQ Access">MQ Access</option>
        </select>
        <label>Corporate Access Type</label>
      </div>
    </div>
  `
})
export class MfSalesComponent { @Input() parentForm: FormGroup; }