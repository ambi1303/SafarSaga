'use client';

const HeroSection = () => {

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop")'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl w-full">
        {/* Main Heading */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight animate-slide-in-up">
            Explore the World
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-6 text-orange-400 animate-slide-in-up text-shimmer" style={{ animationDelay: '0.2s' }}>
            with SafarSaga
          </h2>
        </div>

        {/* Subheading */}
        <p className="text-lg sm:text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
          Discover incredible destinations across India with our expertly crafted travel packages
        </p>



        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12 text-white/90 stagger-animation">
          <div className="text-center hover-bounce">
            <div className="text-2xl sm:text-3xl font-bold text-white animate-heartbeat">2,500+</div>
            <div className="text-sm sm:text-base">Happy Travelers</div>
          </div>
          <div className="text-center hover-bounce">
            <div className="text-2xl sm:text-3xl font-bold text-white animate-heartbeat">50+</div>
            <div className="text-sm sm:text-base">Destinations</div>
          </div>
          <div className="text-center hover-bounce">
            <div className="text-2xl sm:text-3xl font-bold text-white animate-heartbeat">4.9★</div>
            <div className="text-sm sm:text-base">Rating</div>
          </div>
          <div className="text-center hover-bounce">
            <div className="text-2xl sm:text-3xl font-bold text-white animate-heartbeat">24/7</div>
            <div className="text-sm sm:text-base">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;