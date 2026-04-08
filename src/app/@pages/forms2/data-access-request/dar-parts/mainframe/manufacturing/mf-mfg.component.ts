// Summary: Controls Corporate-specific mainframe logic: ChangeMan, CICS, and Sales DB2 Routing.

import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-mf-mfg',
  template: `
    <div [formGroup]="parentForm" class="p-3 border-start border-4 border-success rounded mb-3">
      <h6 class="text-success fw-bold">PLANT MAINFRAME OPTIONS</h6>
      <div class="form-floating mb-3">
        <select class="form-select" formControlName="v_dar_mf_what_system">
          <option value="ALC">ALC (IMS/EKBM)</option>
          <option value="Buy-off">Buy-off</option>
          <option value="Other">Other</option>
        </select>
        <label>Mainframe System</label>
      </div>
    </div>
  `
})
export class MfMfgComponent { @Input() parentForm: FormGroup; }