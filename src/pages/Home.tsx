import React, { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/products');
    }
  }, [session, navigate]);

  if (session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-blue-100">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center p-8 rounded-lg backdrop-blur-sm bg-white/30"
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20 
          }}
          className="text-5xl font-bold mb-8"
        >
          <span className="text-[#F97316]">السوق</span>
          <span className="text-[#0EA5E9]"> الحر</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#F97316] to-[#0EA5E9] text-transparent bg-clip-text"
        >
          Welcome to Our Online Shopping Space
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-700 mb-8 text-lg"
        >
          Please login or sign up to continue your shopping journey
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-x-4"
        >
          <Button 
            onClick={() => navigate('/login')}
            className="bg-[#F97316] hover:bg-orange-600 text-white px-8 py-2"
          >
            Login
          </Button>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-[#0EA5E9] hover:bg-blue-600 text-white px-8 py-2"
          >
            Sign Up
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}