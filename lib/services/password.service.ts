import { scrypt, argon2Verify } from "hash-wasm";

export interface IPasswordService {
  hash(password: string): Promise<string>;
  verify(hash: string, password: string): Promise<boolean>;
}

/**
 * PasswordService handles password hashing and verification.
 * It uses Scrypt as the default for new hashes but supports verifying legacy Argon2id hashes.
 * Designed to be compatible with Cloudflare Workers (Edge Runtime).
 */
export class PasswordService implements IPasswordService {
  private readonly SCRYPT_PREFIX = "$scrypt$";
  private readonly ARGON2_PREFIX = "$argon2id$";

  // Scrypt parameters (Standard secure defaults)
  private readonly scryptOptions = {
    costFactor: 16384,
    blockSize: 8,
    parallelism: 1,
    saltSize: 16,
    hashLength: 32,
  };

  /**
   * Hashes a password using Scrypt.
   * Format: $scrypt$v=0$n=16384,r=8,p=1$<salt-base64>$<hash-base64>
   */
  async hash(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    const salt = crypto.getRandomValues(new Uint8Array(this.scryptOptions.saltSize));
    
    const hashData = await scrypt({
      password: passwordBytes,
      salt: salt,
      costFactor: this.scryptOptions.costFactor,
      blockSize: this.scryptOptions.blockSize,
      parallelism: this.scryptOptions.parallelism,
      hashLength: this.scryptOptions.hashLength,
      outputType: "binary",
    });

    const saltB64 = this.toBase64(salt).replace(/=/g, "");
    const hashB64 = this.toBase64(hashData).replace(/=/g, "");

    return `${this.SCRYPT_PREFIX}v=0$n=${this.scryptOptions.costFactor},r=${this.scryptOptions.blockSize},p=${this.scryptOptions.parallelism}$${saltB64}$${hashB64}`;
  }

  /**
   * Verifies a password against a hash.
   * Supports both new Scrypt hashes and legacy Argon2id hashes.
   */
  async verify(hash: string, password: string): Promise<boolean> {
    if (hash.startsWith(this.SCRYPT_PREFIX)) {
      return this.verifyScrypt(hash, password);
    } else if (hash.startsWith(this.ARGON2_PREFIX)) {
      return this.verifyArgon2(hash, password);
    }
    
    console.warn("[PasswordService] Unrecognized hash format");
    return false;
  }

  private async verifyScrypt(hash: string, password: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    const parts = hash.split("$");
    
    // Format: $scrypt$v=0$params$salt$hash
    if (parts.length !== 6) return false;

    const params = parts[3];
    const saltB64 = parts[4];
    const hashB64 = parts[5];

    const n = parseInt(params.match(/n=(\d+)/)?.[1] || "16384");
    const r = parseInt(params.match(/r=(\d+)/)?.[1] || "8");
    const p = parseInt(params.match(/p=(\d+)/)?.[1] || "1");

    const salt = this.fromBase64(saltB64);
    const originalHash = this.fromBase64(hashB64);

    const checkHash = await scrypt({
      password: passwordBytes,
      salt: salt,
      costFactor: n,
      blockSize: r,
      parallelism: p,
      hashLength: originalHash.length,
      outputType: "binary",
    });

    return this.constantTimeEqual(originalHash, checkHash);
  }

  private async verifyArgon2(hash: string, password: string): Promise<boolean> {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    
    try {
      // hash-wasm's argon2Verify handles standard PHC encoded strings
      return await argon2Verify({
        password: passwordBytes,
        hash: hash
      });
    } catch (e) {
      console.error("[PasswordService] Argon2 verification failed:", e);
      return false;
    }
  }

  private constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }

  /**
   * Internal Base64 encoding helper for Cloudflare Workers / Edge runtime.
   */
  private toBase64(bytes: Uint8Array): string {
    const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join("");
    return btoa(binary);
  }

  /**
   * Internal Base64 decoding helper that handles missing padding.
   */
  private fromBase64(base64: string): Uint8Array {
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, c => c.charCodeAt(0));
  }
}

