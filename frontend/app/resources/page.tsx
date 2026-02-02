'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  WrenchScrewdriverIcon,
  MapIcon,
  BuildingLibraryIcon,
  HomeModernIcon,
  HeartIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <WrenchScrewdriverIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              Resource Discovery
            </h1>
            <p className="text-xl text-gray-600">
              Connecting you with essential services and opportunities
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-8 mb-12 text-center"
        >
          <div className="inline-block mb-4">
            <span className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-bold">
              V2 FEATURE
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            In Development for V2 Release
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6">
            We're building a comprehensive resource discovery system that will help you 
            find and access essential services in real-time. This feature will be part 
            of our V2 platform with AI-powered assistance.
          </p>
          <Link
            href="/about"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Learn About V2 Roadmap
          </Link>
        </motion.div>

        {/* Coming Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What's Coming in V2
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: HomeModernIcon,
                title: 'Shelter Availability',
                description: 'Real-time bed availability at nearby shelters with direct contact information',
                color: 'blue'
              },
              {
                icon: HeartIcon,
                title: 'Food Programs',
                description: 'Locations and schedules for food banks, soup kitchens, and meal programs',
                color: 'red'
              },
              {
                icon: BuildingLibraryIcon,
                title: 'Support Services',
                description: 'Healthcare, mental health, addiction recovery, and counseling services',
                color: 'green'
              },
              {
                icon: BriefcaseIcon,
                title: 'Employment Help',
                description: 'Job listings, training programs, and career development resources',
                color: 'orange'
              },
              {
                icon: MapIcon,
                title: 'Location-Based Search',
                description: 'Find resources near you with maps and directions',
                color: 'purple'
              },
              {
                icon: WrenchScrewdriverIcon,
                title: 'AI-Guided Navigation',
                description: 'Personalized assistance to help you access the right resources',
                color: 'indigo'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-md border-2 border-dashed border-gray-200"
              >
                <feature.icon className={`w-12 h-12 text-${feature.color}-600 mb-4`} />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Current Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-8 shadow-lg border-2 border-blue-200"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            What You Can Do Right Now
          </h2>
          <p className="text-gray-600 text-center mb-6">
            While we build V2, you can use these features today:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/tell-story"
              className="flex flex-col items-center p-6 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border-2 border-blue-200"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Tell Your Story</h3>
              <p className="text-sm text-gray-600 text-center">
                Create your fundraising profile
              </p>
            </Link>

            <Link
              href="/support"
              className="flex flex-col items-center p-6 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border-2 border-purple-200"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Get Support</h3>
              <p className="text-sm text-gray-600 text-center">
                Submit a support ticket
              </p>
            </Link>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>
            Have feedback or suggestions for the resources you'd like to see?{' '}
            <Link href="/support" className="text-blue-600 hover:underline font-semibold">
              Let us know
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
