import { describe, it, expect, vi, beforeEach } from 'vitest'
import firebaseAuthService from '../firebaseAuthService'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth'

// Mock Firebase auth
vi.mock('../firebaseAuthService', () => ({
  default: {
    registerUser: vi.fn(),
    signInUser: vi.fn(),
    signOutUser: vi.fn(),
    resetPassword: vi.fn(),
    getCurrentUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    getErrorMessage: vi.fn(),
  }
}))

describe('FirebaseAuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User'
      }

      const mockUserCredential = {
        user: mockUser
      }

      createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential)
      updateProfile.mockResolvedValue()
      sendEmailVerification.mockResolvedValue()

      const result = await firebaseAuthService.registerUser(
        'test@example.com',
        'password123',
        'Test User'
      )

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(result.message).toContain('Registration successful')
    })

    it('should handle registration error', async () => {
      const error = { code: 'auth/email-already-in-use' }
      createUserWithEmailAndPassword.mockRejectedValue(error)

      const result = await firebaseAuthService.registerUser(
        'existing@example.com',
        'password123',
        'Test User'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.code).toBe('auth/email-already-in-use')
    })
  })

  describe('signInUser', () => {
    it('should sign in user successfully', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com'
      }

      const mockUserCredential = {
        user: mockUser
      }

      signInWithEmailAndPassword.mockResolvedValue(mockUserCredential)

      const result = await firebaseAuthService.signInUser(
        'test@example.com',
        'password123'
      )

      expect(result.success).toBe(true)
      expect(result.user).toEqual(mockUser)
      expect(result.message).toContain('Sign in successful')
    })

    it('should handle sign in error', async () => {
      const error = { code: 'auth/wrong-password' }
      signInWithEmailAndPassword.mockRejectedValue(error)

      const result = await firebaseAuthService.signInUser(
        'test@example.com',
        'wrongpassword'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.code).toBe('auth/wrong-password')
    })
  })

  describe('signOutUser', () => {
    it('should sign out user successfully', async () => {
      signOut.mockResolvedValue()

      const result = await firebaseAuthService.signOutUser()

      expect(result.success).toBe(true)
      expect(result.message).toContain('Signed out successfully')
    })

    it('should handle sign out error', async () => {
      const error = { code: 'auth/network-request-failed' }
      signOut.mockRejectedValue(error)

      const result = await firebaseAuthService.signOutUser()

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      sendPasswordResetEmail.mockResolvedValue()

      const result = await firebaseAuthService.resetPassword('test@example.com')

      expect(result.success).toBe(true)
      expect(result.message).toContain('Password reset email sent')
    })

    it('should handle password reset error', async () => {
      const error = { code: 'auth/user-not-found' }
      sendPasswordResetEmail.mockRejectedValue(error)

      const result = await firebaseAuthService.resetPassword('nonexistent@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getErrorMessage', () => {
    it('should return correct error messages for known codes', () => {
      const errorMessages = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters long.',
        'auth/invalid-email': 'Please enter a valid email address.',
      }

      Object.entries(errorMessages).forEach(([code, expectedMessage]) => {
        const message = firebaseAuthService.getErrorMessage(code)
        expect(message).toBe(expectedMessage)
      })
    })

    it('should return default message for unknown error codes', () => {
      const message = firebaseAuthService.getErrorMessage('auth/unknown-error')
      expect(message).toBe('An error occurred. Please try again.')
    })
  })
}) 