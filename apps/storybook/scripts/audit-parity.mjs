const parityFields = ["visibleText", "accessibleSnapshot", "controlStates"];

const comparableValue = (value) => typeof value === "string" ? value : JSON.stringify(value);

/**
 * Compares the user-visible and accessibility-relevant result of one story at
 * one viewport. Allowances are exact value pairs with a reason, so a future
 * intentional narrow-theme presentation difference cannot hide other drift.
 */
export function compareThemeParity(light, dark, allowances = []) {
  const problems = [];
  for (const field of parityFields) {
    const lightValue = comparableValue(light[field]);
    const darkValue = comparableValue(dark[field]);
    if (lightValue === darkValue) continue;
    const allowed = allowances.some((allowance) => allowance.field === field
      && allowance.light === lightValue
      && allowance.dark === darkValue
      && allowance.reason.trim().length > 0);
    if (!allowed) problems.push(`${field} differs between Light and Dark`);
  }
  return problems;
}
