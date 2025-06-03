import React from "react";
import Navbar from "../Components/Landing/Navbar";
import HowItWorks from "../Components/Landing/HowItWorks";
import PremiumFeatures from "../Components/Landing/PremiumFeatures";
import UseCases from "../Components/UseCases";
import PricingSection from "../Components/Landing/PricingSection";
import SupportSection from "../Components/Landing/SupportSection";
import FinalCTA from "../Components/Landing/FinalCTA";
import Footer from "../Components/Landing/Footer";
import HeroSection from "../Components/Landing/HeroSection";

const Landing = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#1B212C]">
      <Navbar onNavigate={onNavigate} />
      <HeroSection onNavigate={onNavigate} />
      <HowItWorks />
      <PremiumFeatures />
      <UseCases />
      <PricingSection />
      <SupportSection />
      <FinalCTA onNavigate={onNavigate} />
      <Footer />
    </div>
  );
};

export default Landing;
