import { install } from 'react-native-quick-crypto';
// Must run before any module that transitively imports @noble/hashes/crypto,
// which captures globalThis.crypto at module-evaluation time (not call-time).
install();
