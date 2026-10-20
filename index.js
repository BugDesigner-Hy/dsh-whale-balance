/**
 * Host half of the balance-vessel bundle.
 *
 * The balance itself is read in the browser from the account Remote that the
 * profile already mounts (`remote.account.getBalance`), so this half registers
 * nothing and needs no credentials of its own. It only exists so the bundle has
 * a Loader seat.
 */
export function apply() {}
