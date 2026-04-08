/**
 * Celebration Utilities
 * 
 * Helper functions for celebration animations and confetti prep (Phase 3.1 enhancements).
 */

import { useCallback, useState } from "react";

/**
 * Hook to manage celebration confetti
 * Phase 3: Stub implementation
 * Phase 3.1: Wire to react-confetti or canvas library
 */
export function useCelebrationConfetti() {
  const [isActive, setIsActive] = useState(false);

  const triggerConfetti = useCallback(() => {
    setIsActive(true);
    // Phase 3.1: Trigger confetti canvas
  }, []);

  const stopConfetti = useCallback(() => {
    setIsActive(false);
    // Phase 3.1: Stop confetti
  }, []);

  return {
    triggerConfetti,
    stopConfetti,
    isActive,
  };
}

/**
 * Hook to manage celebration sound
 * Phase 3: Stub implementation
 * Phase 3.1: Wire to audio file or Web Audio API
 */
export function useCelebrationSound() {
  const playCelebrationSound = useCallback(() => {
    // Phase 3.1: Play celebration sound
  }, []);

  return {
    playCelebrationSound,
  };
}

/**
 * Get animation sequence variants for celebration
 * Exported for Phase 3.1 to extend
 */
export interface CelebrationSequence {
  emojiAnimation: object;
  textAnimation: object;
}

export function getCelebrationSequence(
  _habitCount: number
): CelebrationSequence {
  return {
    emojiAnimation: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
    },
    textAnimation: {
      opacity: [0, 1],
      y: [20, 0],
    },
  };
}

/**
 * Track celebration event for analytics
 * Optional: for Firebase analytics in Phase 3.1
 */
export function trackCelebration(_habitCount: number, _timezone: string): void {
  // Phase 3.1: Send to Firebase Analytics
}
