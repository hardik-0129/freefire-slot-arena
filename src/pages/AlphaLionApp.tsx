import Footer from '@/components/Footer';
import { Header } from '@/components/Header';
import LandingPage from '../components/LandingPage';
import AppScreenshot from '@/components/AppScreenshot';
import Features from '@/components/Features';
import { TournamentSection } from '@/components/TournamentSection';
import HowToPlay from '@/components/HowToPlay';

const AlphaLionApp = () => {
  return (
    <div>
        <Header /> 
        <LandingPage />
        <AppScreenshot />
        <Features />
        <TournamentSection />
        <HowToPlay />
        <Footer />
    </div>
  )
}

export default AlphaLionApp