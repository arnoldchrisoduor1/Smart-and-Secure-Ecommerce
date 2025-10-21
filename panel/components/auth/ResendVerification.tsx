'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import Button from '../ButtonComponent';
import Input from '../InputComponent';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface ResendVerificationProps {
  email: string;
  onBackToLogin: () => void;
}

const ResendVerification: React.FC<ResendVerificationProps> = ({ 
  email: initialEmail, 
  onBackToLogin 
}) => {
  const [email, setEmail] = useState(initialEmail);
  const { resendVerificationEmail, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      await resendVerificationEmail(email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      // Error handled by interceptor
      console.error('Resend verification error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a verification link to your email. Please check your inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail size={20} />}
          placeholder="your@email.com"
          helperText="Enter your email to resend verification link"
        />

        <div className="space-y-3">
          <Button
            type="submit"
            loading={isLoading}
            className="w-full"
            size="lg"
          >
            Resend Verification Email
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onBackToLogin}
            className="w-full"
          >
            Back to Login
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Already verified?{' '}
          <button
            onClick={onBackToLogin}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Sign in here
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default ResendVerification;