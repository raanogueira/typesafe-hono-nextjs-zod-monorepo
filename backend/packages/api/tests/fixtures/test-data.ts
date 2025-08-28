// Test fixtures - deterministic test data for all scenarios

// Test constants

export const TEST_CONSTANTS = {
  // Fixed timestamps for deterministic testing
  FIXED_TIME: '2025-08-09T21:30:00.000Z',
  PAST_TIME: '2025-08-08T21:30:00.000Z',
  FUTURE_TIME: '2025-08-10T21:30:00.000Z',

  // Fixed random values
  RANDOM_SEED: 0.123456789,

  // Test environment values
  TEST_PORT: 3001,
  TEST_HOST: '127.0.0.1',
} as const

// Branded type test data

export const TEST_IDS = {
  USER_ID_1: 'user_1234567890abcdef' as const,
  USER_ID_2: 'user_abcdef1234567890' as const,
  ACCOUNT_ID_1: 'acc_1234567890abcdef' as const,
  ACCOUNT_ID_2: 'acc_abcdef1234567890' as const,
  TRANSACTION_ID_1: 'tx_1234567890abcdef' as const,
  TRANSACTION_ID_2: 'tx_abcdef1234567890' as const,
} as const

// Validation test data

export const VALIDATION_TEST_CASES = {
  VALID_EMAIL: 'test@example.com',
  INVALID_EMAILS: ['', 'not-an-email', '@example.com', 'test@', 'test..test@example.com'],

  VALID_PASSWORDS: ['StrongPassword123!', 'Another@Valid1', 'Complex$Pass9'],
  INVALID_PASSWORDS: [
    '',
    '123',
    'short',
    'nouppercase123!',
    'NOLOWERCASE123!',
    'NoNumbers!',
    'NoSpecialChars123',
  ],

  VALID_UUIDS: ['123e4567-e89b-12d3-a456-426614174000', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
  INVALID_UUIDS: [
    '',
    'not-a-uuid',
    '123e4567-e89b-12d3-a456',
    '123e4567-e89b-12d3-a456-426614174000-extra',
  ],
} as const

// Health check test data

export const HEALTH_CHECK_RESPONSES = {
  HEALTHY: {
    success: true,
    data: {
      status: 'healthy' as const,
      checks: {
        database: {
          status: 'up' as const,
          message: 'Database connection healthy',
          lastChecked: TEST_CONSTANTS.FIXED_TIME,
        },
      },
      timestamp: TEST_CONSTANTS.FIXED_TIME,
      uptime: 3600,
      version: '1.0.0',
    },
    meta: {
      timestamp: TEST_CONSTANTS.FIXED_TIME,
      version: 'v1',
    },
  },

  UNHEALTHY: {
    success: false,
    error: {
      code: 'HEALTH_CHECK_FAILED',
      message: 'System is unhealthy',
      details: {
        database: 'Connection failed',
      },
    },
    meta: {
      timestamp: TEST_CONSTANTS.FIXED_TIME,
    },
  },
} as const

// API response test data

export const API_RESPONSES = {
  SUCCESS_EMPTY: {
    success: true,
    data: null,
    meta: {
      timestamp: TEST_CONSTANTS.FIXED_TIME,
    },
  },

  VALIDATION_ERROR: {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: {
        email: 'Email is required',
      },
    },
    meta: {
      timestamp: TEST_CONSTANTS.FIXED_TIME,
    },
  },

  NOT_FOUND: {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found',
    },
    meta: {
      timestamp: TEST_CONSTANTS.FIXED_TIME,
    },
  },
} as const

// System metrics test data

export const SYSTEM_METRICS = {
  NORMAL: {
    timestamp: TEST_CONSTANTS.FIXED_TIME,
    uptime: 3600,
    memory: {
      rss: 72417280,
      heapUsed: 11513112,
      heapTotal: 20021248,
      external: 3888611,
    },
    pid: 8048,
    nodeVersion: 'v24.5.0',
    platform: 'darwin',
    arch: 'arm64',
  },
} as const

// Error test cases

export const ERROR_TEST_CASES = {
  NETWORK_ERROR: new Error('Network request failed'),
  TIMEOUT_ERROR: new Error('Request timeout'),
  VALIDATION_ERROR: new Error('Invalid input provided'),
  DATABASE_ERROR: new Error('Database connection failed'),
  PERMISSION_ERROR: new Error('Access denied'),
} as const
