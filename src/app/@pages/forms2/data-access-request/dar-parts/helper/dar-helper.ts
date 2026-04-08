import { FormGroup, Validators } from '@angular/forms';
import { SERVICE_NOW_CONSTANTS } from '../dar-constants';
import { TRIGGERS } from './dar-form-helper';

export class DarHelper {
  static isSqlPlatform(platform: string): boolean {
    const sqlPlatforms = ['SQL', 'My SQL', 'PostgreSQL', 'TBDP (IRM, PASA, C360, Q360, IRM-Pricing, etc.)'];
    return sqlPlatforms.includes(platform);
  }

  static isApiPlatform(platform: string): boolean {
    return platform === 'API (EIG Application Support)';
  }

  static getDomainHex(domainLabel: string): string {
    const domain = SERVICE_NOW_CONSTANTS.DOMAINS.find(d => d.label === domainLabel);
    return domain ? domain.hex : '';
  }

  static formatPayload(form: FormGroup): any {
    const rawData = form.getRawValue();
    const payload = {};

    Object.keys(rawData).forEach(key => {
      const val = rawData[key];
      if (val !== null && val !== undefined && val !== '') {
        if (typeof val === 'boolean') {
          payload[key] = val.toString();
        } else {
          payload[key] = val;
        }
      }
    });

    const platform = rawData['v_dar_platform'];
    // default routing id fallback
    payload['v_custom_routing_rule_identifier'] = SERVICE_NOW_CONSTANTS.ROUTING_IDS[platform] || '6';

    return payload;
  }
}

function mapValidator(name: string) {
  if (name === 'required') return Validators.required;
  if (name === 'requiredTrue') return Validators.requiredTrue;
  if (name === 'minLength10') return Validators.minLength(10);
  return Validators.nullValidator;
}

function applyConditionForTargets(form: FormGroup, matches: boolean, targets: { control: string; validators?: string[] }[]) {
  targets.forEach(t => {
    const ctrl = form.get(t.control);
    if (!ctrl) return;
    if (matches) {
      const vFns = (t.validators || []).map(mapValidator);
      ctrl.setValidators(vFns);
      ctrl.updateValueAndValidity({ emitEvent: false });
    } else {
      ctrl.clearValidators();
      ctrl.updateValueAndValidity({ emitEvent: false });
    }
  });
}

export function initTriggerSubscriptions(form: FormGroup) {
  TRIGGERS.forEach(trigger => {
    const parent = form.get(trigger.control);
    if (!parent) return;
    const evaluate = (val: any) => {
      trigger.conditions.forEach(cond => {
        const matches = val === cond.value;
        applyConditionForTargets(form, matches, cond.targets);
      });
    };
    parent.valueChanges.subscribe(v => evaluate(v));
    evaluate(parent.value);
  });
}