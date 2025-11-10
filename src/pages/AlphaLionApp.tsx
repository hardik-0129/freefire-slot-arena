import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import LandingPage from '../components/LandingPage';
import AppScreenshot from '@/components/AppScreenshot';
import Features from '@/components/Features';
import { TournamentSection } from '@/components/TournamentSection';
import HowToPlay from '@/components/HowToPlay';
import { HeroBanner } from '@/components/HeroBanner';

const AlphaLionApp = () => {
  return (
    <div>
        <Header /> 
        {/* <LandingPage /> */}
        <HeroBanner />
        <AppScreenshot />
        <Features />
        <TournamentSection />
        <HowToPlay />
        <Footer />
    </div>
  )
}

export default AlphaLionApp