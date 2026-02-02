'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  MicrophoneIcon, 
  DocumentTextIcon, 
  QrCodeIcon,
  ChatBubbleLeftRightIcon,
  BriefcaseIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4"
            >
              <HeartIcon className="w-20 h-20 text-blue-600 mx-auto" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-black text-gray-900 mb-6"
            >
              Empowering Stories,
              <br />
              <span className="text-blue-600">Building Futures</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8"
            >
              Care2Connect gives people experiencing homelessness the digital tools 
              to market themselves for support—just like modern advertising, but for 
              human connection and opportunity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link
                href="/tell-story"
                className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Tell Your Story
              </Link>
              <Link
                href="/find"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg border-2 border-blue-600"
              >
                Find a Profile
              </Link>
              <Link
                href="/support"
                className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Support
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-gray-900 mb-4">
              Our Mission
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
              To empower individuals experiencing homelessness with the same powerful 
              digital marketing tools that businesses use, helping them tell their story 
              and connect with supporters who can help.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* V1 Features - Current Platform */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-block mb-4">
              <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold">
                V1 - AVAILABLE NOW
              </span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-gray-900 mb-4">
              Tell Your Story, Get Support
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform helps you create a professional fundraising presence in minutes
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: MicrophoneIcon,
                title: '1. Record Your Story',
                description: 'Share your journey, goals, and what support you need—in your own voice',
                color: 'blue'
              },
              {
                icon: DocumentTextIcon,
                title: '2. AI-Generated Draft',
                description: 'Our AI transforms your story into a professional GoFundMe-style pitch',
                color: 'purple'
              },
              {
                icon: DocumentTextIcon,
                title: '3. Edit & Refine',
                description: 'Review and customize your draft to make it perfect',
                color: 'indigo'
              },
              {
                icon: QrCodeIcon,
                title: '4. Get Your QR Code',
                description: 'Receive a scannable QR code for in-person donations via Stripe',
                color: 'pink'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className={`w-16 h-16 bg-${step.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <step.icon className={`w-8 h-8 text-${step.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* V2 Roadmap */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-block mb-4">
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                V2 - IN DEVELOPMENT
              </span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl font-bold text-gray-900 mb-4">
              The Future: AI-Powered Navigation
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Coming soon: An intelligent assistant to help you navigate challenges and discover opportunities
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: ChatBubbleLeftRightIcon,
                title: 'AI Chat Assistant',
                description: 'Get personalized guidance for overcoming obstacles and accessing services',
                color: 'green'
              },
              {
                icon: BriefcaseIcon,
                title: 'Job Discovery',
                description: 'Find employment opportunities matched to your skills and location',
                color: 'orange'
              },
              {
                icon: HomeIcon,
                title: 'Resource Discovery',
                description: 'Real-time info on food giveaways, shelter availability, and support services',
                color: 'red'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
              >
                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="mt-4 text-sm text-gray-500 italic">Coming in V2</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Whether you need help or want to support someone, Care2Connect is here for you
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/tell-story"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Share Your Story
              </Link>
              <Link
                href="/find"
                className="px-8 py-4 bg-purple-700 text-white rounded-lg font-bold text-lg hover:bg-purple-800 transition-colors shadow-lg"
              >
                Find Someone to Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
