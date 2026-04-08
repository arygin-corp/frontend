import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { createMasterDarForm } from './dar-parts/models/dar-form.models';
import { DarRulesService } from './dar-parts/rules/dar-rules.service';
import { CartService } from '../../../@shared/services/cart.service';
import { AppService } from '../../../@shared/services/app.service'; 
import { NotificationService } from '../../../@shared/services/notification.service';
import { SERVICE_NOW_CONSTANTS } from './dar-parts/dar-constants';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AiSuggestionService } from '../../../@shared/services/ai-suggestion.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SuggestedAiComponent } from '../../../@shared/components/suggested-ai/suggested-ai.component';
import { forkJoin, timer } from 'rxjs';

@Component({
  selector: 'app-data-access-request',
  templateUrl: './data-access-request.component.html',
  styleUrls: ['./data-access-request.component.scss']
})
export class DataAccessRequestComponent implements OnInit {
  @ViewChild('aiModal') aiModal!: SuggestedAiComponent;
  form!: FormGroup;
  currentApplicationVersion = environment.appVersion;
  
  platforms = Object.keys(SERVICE_NOW_CONSTANTS.ROUTING_IDS);
  domains = SERVICE_NOW_CONSTANTS.DOMAINS;
  
  public isReadOnly: boolean = false;
  public isProcessing: boolean = false; 
  biTypes: string[] = ['Power BI', 'Tableau', 'Looker', 'Other'];
  oracleTypes: string[] = ['Standard', 'Enterprise', 'Cloud'];
  mainframeTypes: string[] = ['Db2', 'IMS', 'VSAM'];
  requiredControls: { label: string, valid: boolean }[] = [];

  aiSuggestions: any[] = [];
  isAiThinking: boolean = false;
  isAiLoading: boolean = false;

  constructor(
    private rules: DarRulesService,
    public cart: CartService,
    private router: Router,
    private http: HttpClient,
    public appSvc: AppService,
    private notify: NotificationService,
    private suggestedAI: AiSuggestionService 
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.form = createMasterDarForm();

    this.form.get('v_dar_platform')?.valueChanges.subscribe(val => {
      this.rules.applyPlatformRules(this.form);
    });

    this.form.get('v_emd_PI_access')?.valueChanges.subscribe(val => {
      this.rules.applySecurityRules(this.form, val);
    });

    this.setupAiSuggestions();
  }

  setupAiSuggestions() {
    const aiFields = ['v_dar_post_database_schema', 'v_dar_post_table_names', 'v_dar_DataReqDescription'];

    this.form.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged((prev, curr) => aiFields.every(field => prev[field] === curr[field]))
    ).subscribe(values => {
      const hasSchema = values.v_dar_post_database_schema?.length > 3;
      const hasTables = values.v_dar_post_table_names?.length > 3;
      const hasDesc = values.v_dar_DataReqDescription?.length > 5;
      
      if ((hasSchema && hasTables) || hasDesc) {
        // 1. ACTIVATE LOADER AND OPEN MODAL IMMEDIATELY
        this.isAiThinking = true;
        this.isAiLoading = true;
        this.aiSuggestions = []; // Clear old suggestions
        this.aiModal.open();     // Modal pops up with the spinning orb now!

        // 2. Start the API call in the background
        this.suggestedAI.getSuggestions({
          'database-schema': values.v_dar_post_database_schema,
          'tablenames': values.v_dar_post_table_names,
          'data-request-description': values.v_dar_DataReqDescription,
          'intended-use': values.v_dar_businessJustification
        }).subscribe({
          next: (res) => {
            const suggestions = res.suggestions || res.results || res || [];
            if (suggestions.length > 0) {
              this.aiSuggestions = suggestions.map((p: any) => {
                // ... your existing mapping logic ...
                return { ...p, isVerified: p.match_percentage >= 98 };
              });
              
              this.isAiLoading = false;
              // 3. Keep the orb spinning for a brief moment (e.g. 1.2s) for "AI feel"
              // then switch to the results
              setTimeout(() => {
                this.isAiThinking = false;
              }, 1200);
            } else {
              // No suggestions found: reset and AUTO-CLOSE
              this.isAiThinking = false;
              this.isAiLoading = false;
              this.aiSuggestions = [];
              this.aiModal.close(); 
            }
          },
          error: () => {
            this.isAiThinking = false;
            this.isAiLoading = false;
            this.aiModal.close();
          }
        });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.validateAllFormFields(this.form);
      return;
    }

    this.isProcessing = true;
    const formData = this.form.getRawValue();

    this.cart.addDataRequest(formData).subscribe({
      next: () => {
        this.isProcessing = false;
        this.notify.showSuccess('This Data Access Request has been added to your cart.', 'Success');
        this.router.navigate(['/marketplace/order/cart']);
      },
      error: (err) => {
        this.isProcessing = false;
        this.notify.showError('Something went wrong. Please try again.', 'Error');
        console.error('Error adding DAR to cart:', err);
      }
    });
  }

  isFieldValid(field: string): boolean {
    const control = this.form.get(field);
    return control ? (!control.valid && control.touched) : false;
  }

  onUserSelected(user: any) {
    if (user && user.id) {
      this.form.patchValue({ v_dar_objectid_reqfor: user.id });
    }
  }

  handleExclusive(type: 'grant' | 'revoke', group: 'plan' | 'table') {
    const isGrant = type === 'grant';
    if (group === 'plan') {
      this.form.patchValue({ b_dar_mf_db2_plan_grant: isGrant, b_dar_mf_db2_plan_revoke: !isGrant });
    } else {
      this.form.patchValue({ b_dar_mf_db2_grant: isGrant, b_dar_mf_db2_revoke: !isGrant });
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }
}