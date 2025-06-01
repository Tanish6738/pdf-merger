import React from "react";
import Navbar from "../Components/Navbar";
import HeroSection from "../Components/HeroSection";
import HowItWorks from "../Components/HowItWorks";
import PremiumFeatures from "../Components/PremiumFeatures";
import UseCases from "../Components/UseCases";
import PricingSection from "../Components/PricingSection";
import SupportSection from "../Components/SupportSection";
import FinalCTA from "../Components/FinalCTA";
import Footer from "../Components/Footer";

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
