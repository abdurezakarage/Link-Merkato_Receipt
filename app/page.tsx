"use client";

import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Navigation } from "../components/Navigation";
import { FeatureCard } from "../components/FeatureCard";
import { CTA } from "../components/CTA";
import { services } from "../components/servicesData";
import testimonials from "../components/utils/testimonials";
import { Footer } from "../components/footer";


const stats = [
  { number: "200+", label: "Happy Clients" },
  { number: "15+", label: "Years Experience" },
  { number: "100%", label: "Compliance Rate" },
  { number: "24/7", label: "Support Available" },
];

const features = [
  {
    icon: "⚡",
    title: "Fast Processing",
    description: "Quick turnaround times for all your documentation needs",
    color: "blue" as const,
  },
  {
    icon: "🛡️",
    title: "Compliance Guarantee",
    description: "100% compliance with Ethiopian tax and customs regulations",
    color: "green" as const,
  },
  {
    icon: "📞",
    title: "24/7 Support",
    description: "Round-the-clock support for urgent business matters",
    color: "purple" as const,
  },
  {
    icon: "💼",
    title: "Expert Team",
    description: "Experienced professionals with deep industry knowledge",
    color: "orange" as const,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Navigation />
      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white pt-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Link Merkato
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Your Trusted Partner for Professional Tax, Accounting, and Customs Services
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Link Merkato?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide exceptional service with unmatched expertise and reliability
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Professional Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive solutions for all your business needs - from tax compliance to international trade
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.title} className="bg-white shadow-xl rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0">
                <CardContent className="mt-0">
                  <div className="flex items-center mb-6">
                    <div className="text-4xl mr-4">{service.icon}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-gray-600">{service.description}</p>
                    </div>
                  </div>
                  
                  {service.categories.map((cat, catIndex) => (
                    <div key={catIndex} className="mb-6">
                      {cat.title && (
                        <h4 className="text-xl font-semibold text-blue-600 mb-4 flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                          {cat.title}
                        </h4>
                      )}
                      <ul className="space-y-3">
                        {cat.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start">
                            <span className="text-green-500 mr-3 mt-1">✓</span>
                            <span className="text-gray-700 leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  
                  {/* <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                    Learn More About This Service
                  </button> */}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600">Trusted by businesses across Ethiopia</p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
                <CardContent className="mt-0">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">&ldquo;{testimonial.text}&rdquo;</p>
                  <div>
                    <div className="text-blue-600">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h2>
            <p className="text-xl text-gray-600">Ready to get started? Contact us today for a consultation</p>
          </div>
          
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl rounded-2xl p-8 border-0">
            <CardContent className="mt-0">
              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Interest</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Select a service</option>
                    <option>Tax and Accounting Services</option>
                    <option>Customs and Import/Export Services</option>
                    <option>Both Services</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us about your needs..."
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <CTA
        title="Ready to Get Started?"
        description="Join hundreds of satisfied clients who trust Link Merkato for their business needs. Get your free consultation today."
        primaryButton={{
          text: "Get Consultation",
          onClick: () => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        secondaryButton={{
          text: "Learn More",
          onClick: () => {
            document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
      <Footer />
    </div>
  );
}
