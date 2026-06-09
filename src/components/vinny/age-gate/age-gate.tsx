'use client';

import { Button, Dialog, DialogFooter } from '@vinny/ui';
import { useEffect, useState } from 'react';

/**
 * AgeGate — compliance age-verification overlay for spirits / regulated sites.
 * Persists acceptance in localStorage so verified visitors aren't re-prompted.
 *
 * Variant-not-configuration: brand name, minimum age, and a verified callback.
 * A date-of-birth-entry gate (vs. simple yes/no) is a NEW block.
 */
export type AgeGateProps = {
  brand: string;
  minAge?: number;
  onVerified?: () => void;
};

const STORAGE_KEY = 'vinny-age-verified';

export function AgeGate({ brand, minAge = 21, onVerified }: AgeGateProps) {
  // Start closed to avoid an SSR/first-paint flash; open in an effect only if
  // the visitor has not already verified.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== 'true') setOpen(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
    onVerified?.();
  };

  const reject = () => {
    // Send under-age visitors away rather than letting them dismiss the gate.
    window.location.href = 'https://www.responsibility.org/';
  };

  return (
    <Dialog open={open} onClose={() => {}} title={`Welcome to ${brand}`}>
      <p className="opacity-80">You must be {minAge} or older to enter this site.</p>
      <DialogFooter>
        <Button variant="ghost" onClick={reject}>
          I'm under {minAge}
        </Button>
        <Button onClick={accept}>I'm {minAge} or older</Button>
      </DialogFooter>
    </Dialog>
  );
}
