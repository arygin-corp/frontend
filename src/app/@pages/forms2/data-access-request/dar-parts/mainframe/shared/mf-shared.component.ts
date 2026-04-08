// Summary: Manages logic that applies to ALL mainframe requests, such as the Mandatory TSO ID field.

import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-mf-shared',
  template: `
    <div [formGroup]="parentForm" class="p-3 bg-light border-start border-4 border-dark mb-3">
      <div class="form-floating">
        <input class="form-control font-monospace" formControlName="v_dar_mainframe_change_tso_id" placeholder="TSO ID">
        <label>User TSO ID (Required for Mainframe)</label>
      </div>
    </div>
  `
})
export class MfSharedComponent { @Input() parentForm: FormGroup; }