# QUESTION PAPER SECRECY ENGINE

## 1. Zero-Trust Vault
The Question Vault ensures that NO human—including Super Admins—can read the question paper in plaintext once it is sealed.

## 2. Cryptographic Measures
- **AES-256 Encryption:** All question text, options, and metadata are encrypted at rest using AES-256-GCM.
- **Time-Locked Release:** Decryption keys are held in a separate secure KMS and only issued to specific center nodes exactly 5 minutes before the shift starts.
- **Partial Pool Isolation:** Questions are drawn from massive isolated pools, ensuring no single paper exists as a cohesive file until it is dynamically assembled in memory at runtime.

## 3. Leak Tracing & Forensics
- **Forensic Watermarking:** Every question delivered to a candidate's screen is invisibly watermarked (steganography for images, zero-width characters for text) tying it uniquely to the candidate ID and center ID.
- **Emergency Invalidation:** In the event of a suspected leak, `QuestionVaultService` can invalidate the compromised partial pool and hot-swap to a fallback pool in real-time.
