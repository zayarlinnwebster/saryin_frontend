import { FormArray } from '@angular/forms';

export function validateItems(
  formArray: FormArray
): { [key: string]: boolean } | null {
  return formArray.length > 0 ? null : { noItems: true };
}
