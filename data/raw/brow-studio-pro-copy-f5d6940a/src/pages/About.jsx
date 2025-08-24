import React from "react";

export default function About() {
  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-black mb-6">About BRW Bar</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We believe that great brows frame not just your face, but your confidence.
          </p>
        </div>

        <div className="space-y-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-light text-black mb-6">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Founded in 2019, BRW Bar Inc. has been at the forefront of eyebrow artistry, 
                combining traditional techniques with modern innovation to create the perfect 
                brow for every client.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our team of certified professionals is dedicated to enhancing your natural 
                beauty through precision, artistry, and personalized care.
              </p>
            </div>
            <div className="aspect-square rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2126&q=80"
                alt="BRW Bar studio"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="aspect-square rounded-lg overflow-hidden md:order-2">
              <img
                src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80"
                alt="Professional team"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:order-1">
              <h2 className="text-3xl font-light text-black mb-6">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To provide exceptional eyebrow services that enhance natural beauty 
                and boost confidence through expert artistry and personalized care.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We are committed to using only the highest quality products and 
                maintaining the strictest safety standards in all our procedures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}