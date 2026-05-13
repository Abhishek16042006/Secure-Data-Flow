/**
 * FingerprintModal.tsx
 *
 * Identity verification modal — lets users compare public key fingerprints
 * out-of-band (e.g. over a phone call) to confirm they're talking to the
 * right person.
 *
 * This is the UI implementation of Trust-On-First-Use (TOFU).
 *
 * UX states:
 *  first-use — Green banner: "First time chatting — verify their fingerprint"
 *  trusted   — No banner (all good)
 *  changed   — RED WARNING: "Key has changed — possible impersonation"
 *
 * When the warning fires, the user must explicitly confirm before continuing.
 */

import React, { useState } from "react";
import { Shield, ShieldCheck, ShieldAlert, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TrustResult } from "@/lib/trust-store";

interface FingerprintModalProps {
  partnerUsername: string;
  partnerFingerprint: string | null;
  myFingerprint: string | null;
  trustResult: TrustResult;
  onTrust: () => void;
  onClose: () => void;
}

export function FingerprintModal({
  partnerUsername,
  partnerFingerprint,
  myFingerprint,
  trustResult,
  onTrust,
  onClose,
}: FingerprintModalProps) {
  const [showFull, setShowFull] = useState(false);

  const formatFingerprint = (fp: string | null) => {
    if (!fp) return "Computing...";
    if (!showFull) {
      const parts = fp.split(":");
      return `…${parts.slice(-4).join(":")}`;
    }
    // Break into groups of 8 pairs for readability
    const parts = fp.split(":");
    const lines: string[] = [];
    for (let i = 0; i < parts.length; i += 8) {
      lines.push(parts.slice(i, i + 8).join(":"));
    }
    return lines.join("\n");
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border max-w-md w-full p-6 space-y-5 font-mono">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {trustResult === "changed" ? (
              <ShieldAlert className="w-5 h-5 text-red-500" />
            ) : trustResult === "trusted" ? (
              <ShieldCheck className="w-5 h-5 text-primary" />
            ) : (
              <Shield className="w-5 h-5 text-yellow-500" />
            )}
            <span className="font-bold text-sm uppercase tracking-widest">
              Identity Verification
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Trust status banner */}
        {trustResult === "changed" && (
          <div className="border border-red-500 bg-red-500/10 p-3 text-sm text-red-400">
            <div className="font-bold mb-1">⚠ KEY MISMATCH DETECTED</div>
            <div>
              {partnerUsername}'s public key has changed since your last session.
              This could indicate a key substitution attack. Verify their fingerprint
              out-of-band before continuing.
            </div>
          </div>
        )}
        {trustResult === "first-use" && (
          <div className="border border-yellow-500/50 bg-yellow-500/5 p-3 text-sm text-yellow-400">
            <div className="font-bold mb-1">First conversation</div>
            <div>
              Verify {partnerUsername}'s fingerprint below over a trusted channel
              (phone call, in person). Once confirmed, click "Trust this key".
            </div>
          </div>
        )}
        {trustResult === "trusted" && (
          <div className="border border-primary/30 bg-primary/5 p-3 text-sm text-primary">
            <div className="font-bold mb-1">✓ Identity verified</div>
            <div>This key matches your stored trust record for {partnerUsername}.</div>
          </div>
        )}

        {/* Their fingerprint */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">
            {partnerUsername}'s fingerprint (SHA-256)
          </div>
          <div
            className="bg-card border border-card-border p-3 text-xs break-all cursor-pointer"
            onClick={() => setShowFull(!showFull)}
          >
            <pre className="whitespace-pre-wrap font-mono text-primary">
              {formatFingerprint(partnerFingerprint)}
            </pre>
          </div>
          <button
            onClick={() => setShowFull(!showFull)}
            className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"
          >
            {showFull ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showFull ? "Show short" : "Show full fingerprint"}
          </button>
        </div>

        {/* Your fingerprint */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-widest">
            Your fingerprint
          </div>
          <div className="bg-card border border-card-border p-3 text-xs break-all">
            <pre className="whitespace-pre-wrap font-mono text-muted-foreground">
              {formatFingerprint(myFingerprint)}
            </pre>
          </div>
          <div className="text-xs text-muted-foreground">
            Ask them to confirm their fingerprint matches yours out-of-band.
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {trustResult !== "trusted" && (
            <Button
              onClick={onTrust}
              className="flex-1 gap-2"
              variant={trustResult === "changed" ? "destructive" : "default"}
            >
              <ShieldCheck className="w-4 h-4" />
              {trustResult === "changed" ? "Override — I've verified this" : "Trust this key"}
            </Button>
          )}
          <Button onClick={onClose} variant="ghost" className="flex-1">
            {trustResult === "trusted" ? "Close" : "Dismiss"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground border-t border-border pt-3">
          Fingerprints are SHA-256 hashes of ECDH P-256 public keys.
          A mismatch means either the key changed or someone is intercepting.
        </div>
      </div>
    </div>
  );
}
